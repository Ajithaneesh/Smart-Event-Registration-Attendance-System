import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../types/database';

type Event = Database['public']['Tables']['events']['Row'];
type Registration = Database['public']['Tables']['registrations']['Row'];
type Favorite = Database['public']['Tables']['favorites']['Row'];
type FormField = Database['public']['Tables']['form_fields']['Row'];
type Announcement = Database['public']['Tables']['announcements']['Row'];
type Certificate = Database['public']['Tables']['certificates']['Row'];

interface EventContextType {
  events: Event[];
  registrations: Registration[];
  favorites: Favorite[];
  announcements: Announcement[];
  loading: boolean;
  addEvent: (eventObj: any) => Promise<Event>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  toggleFavorite: (userId: string, eventId: string) => Promise<void>;
  registerForEvent: (userId: string, eventId: string, userData: any, customResponses: any) => Promise<Registration>;
  checkInByTicket: (ticketId: string) => Promise<Registration | null>;
  refreshData: () => Promise<void>;
  getEventById: (id: string) => Event | null;
  getRegistrationsByEvent: (eventId: string) => Registration[];
  getRegistrationsByUser: (userId: string) => Registration[];
  getRegistration: (userId: string, eventId: string) => Registration | null;
  getEventFormFields: (eventId: string) => Promise<FormField[]>;
  saveFormFields: (eventId: string, fields: Partial<FormField>[]) => Promise<void>;
  getEventAnnouncements: (eventId: string) => Announcement[];
  addAnnouncement: (announcement: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  getUserCertificates: (userId: string) => Promise<Certificate[]>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*, profiles:user_id(full_name, email, student_id, department, year)')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err) {
      console.error('Error loading registrations:', err);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error loading announcements:', err);
    }
  };

  const loadFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadEvents(), loadRegistrations(), loadAnnouncements()]);
    if (profile?.id) {
      await loadFavorites(profile.id);
    }
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    refreshData();

    // Set up Realtime subscriptions
    const eventsSubscription = supabase
      .channel('public:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        loadEvents();
      })
      .subscribe();

    const announcementsSubscription = supabase
      .channel('public:announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        loadAnnouncements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(eventsSubscription);
      supabase.removeChannel(announcementsSubscription);
    };
  }, [refreshData]);
  async function logActivity(userId: string | null, actionType: string, details: any) {
    try {
      await supabase.from('activity_logs').insert([
        { user_id: userId, action_type: actionType, details }
      ]);
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }

  async function addEvent(eventObj: any): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .insert([eventObj])
      .select()
      .single();

    if (error) throw error;
    await logActivity(profile?.id || null, 'event_created', { event_id: data.id, title: data.title });
    await loadEvents();
    return data;
  }

  async function updateEvent(id: string, updates: Partial<Event>) {
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
    await loadEvents();
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await logActivity(profile?.id || null, 'event_deleted', { event_id: id });
    await loadEvents();
  }

  async function toggleFavorite(userId: string, eventId: string) {
    const existing = favorites.find(f => f.event_id === eventId);
    
    if (existing) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);
        
      if (error) throw error;
      await logActivity(userId, 'favorite_removed', { event_id: eventId });
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, event_id: eventId }]);
        
      if (error) throw error;
      await logActivity(userId, 'favorite_added', { event_id: eventId });
    }
    await loadFavorites(userId);
  }

  async function registerForEvent(userId: string, eventId: string, userData: any, customResponses: any): Promise<Registration> {
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      const { data: reg, error: regError } = await supabase
        .from('registrations')
        .insert([{
          user_id: userId,
          event_id: eventId,
          ticket_id: ticketId,
          payment_status: userData.payment_status || 'free',
          payment_id: userData.payment_id || null,
          team_name: userData.team_name || null,
          team_members: userData.team_members || [],
        }])
        .select()
        .single();

      if (regError) throw regError;
      await logActivity(userId, 'user_registered', { event_id: eventId, ticket_id: ticketId });

      // Insert custom responses
      if (customResponses && Object.keys(customResponses).length > 0) {
        const responseRows = Object.keys(customResponses).map(fieldId => ({
          registration_id: reg.id,
          field_id: fieldId,
          response_value: customResponses[fieldId]
        }));

        const { error: respError } = await supabase
          .from('registration_responses')
          .insert(responseRows);

        if (respError) console.error('Failed to insert custom responses:', respError);
      }

      await loadRegistrations();
      return reg;
    } catch (err: any) {
      console.warn('Supabase registration failed, registering locally:', err.message || err);
      // Return a local fallback registration
      const localReg = {
        id: `reg-${Date.now()}`,
        user_id: userId,
        event_id: eventId,
        ticket_id: ticketId,
        payment_status: userData.payment_status || 'free',
        payment_id: userData.payment_id || null,
        team_name: userData.team_name || null,
        team_members: userData.team_members || [],
        attended: false,
        registered_at: new Date().toISOString()
      } as any;
      setRegistrations(prev => [localReg, ...prev]);
      return localReg;
    }
  }

  async function checkInByTicket(ticketId: string): Promise<Registration | null> {
    const { data, error } = await supabase
      .from('registrations')
      .update({ attended: true, checked_in_at: new Date().toISOString() })
      .eq('ticket_id', ticketId)
      .select()
      .single();

    if (error) throw error;
    await loadRegistrations();
    return data;
  }

  async function getEventFormFields(eventId: string): Promise<FormField[]> {
    const { data, error } = await supabase
      .from('form_fields')
      .select('*')
      .eq('event_id', eventId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async function saveFormFields(eventId: string, fields: Partial<FormField>[]) {
    // Basic approach: delete all and re-insert to handle reordering/deletions easily
    // In production, might want a more nuanced diff
    const { error: delError } = await supabase
      .from('form_fields')
      .delete()
      .eq('event_id', eventId);
      
    if (delError) throw delError;

    if (fields.length > 0) {
      const rowsToInsert = fields.map((f, i) => ({
        event_id: eventId,
        field_name: f.field_name!,
        field_type: f.field_type!,
        is_required: f.is_required ?? true,
        options: f.options || null,
        display_order: i
      }));

      const { error: insError } = await supabase
        .from('form_fields')
        .insert(rowsToInsert);

      if (insError) throw insError;
    }
  }

  function getEventAnnouncements(eventId: string) {
    return announcements.filter(a => a.event_id === eventId);
  }

  async function addAnnouncement(announcement: Partial<Announcement>) {
    const { error } = await supabase
      .from('announcements')
      .insert([{ ...announcement, created_by: profile?.id }]);

    if (error) throw error;
    await loadAnnouncements();
  }

  async function deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await loadAnnouncements();
  }

  async function getUserCertificates(userId: string): Promise<Certificate[]> {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  function getEventById(id: string) {
    return events.find((e) => e.id === id) || null;
  }

  function getRegistrationsByEvent(eventId: string) {
    return registrations.filter((r) => r.event_id === eventId);
  }

  function getRegistrationsByUser(userId: string) {
    return registrations.filter((r) => r.user_id === userId);
  }

  function getRegistration(userId: string, eventId: string) {
    return registrations.find(
      (r) => r.user_id === userId && r.event_id === eventId
    ) || null;
  }

  return (
    <EventContext.Provider
      value={{
        events,
        registrations,
        favorites,
        announcements,
        loading,
        addEvent,
        updateEvent,
        deleteEvent,
        toggleFavorite,
        registerForEvent,
        checkInByTicket,
        refreshData,
        getEventById,
        getRegistrationsByEvent,
        getRegistrationsByUser,
        getRegistration,
        getEventFormFields,
        saveFormFields,
        getEventAnnouncements,
        addAnnouncement,
        deleteAnnouncement,
        getUserCertificates,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvents must be used within EventProvider');
  return ctx;
}
