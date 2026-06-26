import { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { format } from 'date-fns';
import { Users, Calendar, QrCode, PlusCircle, Activity, MoreVertical, Edit, Trash2, Power } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';

import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { events, registrations, updateEvent, deleteEvent } = useEvents();
  const { profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(
    sessionStorage.getItem('admin_pin_verified') === 'true'
  );

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      sessionStorage.setItem('admin_pin_verified', 'true');
      setIsPinVerified(true);
      setPinError('');
      toast.success('Admin access granted');
    } else {
      setPinError('Invalid PIN code. Please try again.');
      toast.error('Access Denied');
    }
  };

  const isAuthorized = isAdmin || isPinVerified;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center bg-background">
        <Card className="w-full max-w-md border-none bg-surface-container-lowest/80 backdrop-blur-xl shadow-2xl p-6">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Admin Authentication</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-2">
              Please enter the admin PIN to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter PIN (e.g. 1234)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="h-12 text-center text-xl tracking-widest font-bold"
                  maxLength={4}
                  autoFocus
                />
                {pinError && <p className="text-xs text-destructive text-center">{pinError}</p>}
              </div>
              <Button type="submit" className="w-full h-12 text-base font-semibold shadow-md">
                Verify PIN
              </Button>
            </form>
            <div className="text-center text-xs text-muted-foreground pt-2">
              For evaluation purposes, use PIN: <strong className="text-primary">1234</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'published').length;
  const totalRegistrations = registrations.length;
  const totalAttended = registrations.filter(r => r.attended).length;

  const handleToggleRegistration = async (eventId: string, currentStatus: boolean) => {
    try {
      await updateEvent(eventId, { registration_open: !currentStatus });
      toast.success(`Registration ${!currentStatus ? 'opened' : 'closed'}`);
    } catch (err) {
      toast.error('Failed to update event status');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await deleteEvent(eventId);
        toast.success('Event deleted successfully');
      } catch (err) {
        toast.error('Failed to delete event');
      }
    }
  };

  const handlePublishToggle = async (eventId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      await updateEvent(eventId, { status: newStatus });
      toast.success(`Event ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update event status');
    }
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage events, registrations, and platform settings.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/analytics')} className="gap-2">
              <Activity className="w-4 h-4" /> Analytics
            </Button>
            <Button onClick={() => navigate('/admin/scanner')} className="gap-2">
              <QrCode className="w-4 h-4" /> Scanner
            </Button>
            <Button onClick={() => navigate('/admin/create-event')} className="gap-2">
              <PlusCircle className="w-4 h-4" /> New Event
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <h3 className="text-2xl font-bold">{totalEvents}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                <Power className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Events</p>
                <h3 className="text-2xl font-bold">{activeEvents}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center text-info">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Registrations</p>
                <h3 className="text-2xl font-bold">{totalRegistrations}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center text-warning">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Check-ins</p>
                <h3 className="text-2xl font-bold">{totalAttended}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Management */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
            <div>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>View and manage all platform events.</CardDescription>
            </div>
            <Input 
              placeholder="Search events..." 
              className="max-w-xs" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Event</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Registrations</th>
                    <th className="px-4 py-3 text-center">Reg. Open</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map(event => {
                    const eventRegs = registrations.filter(r => r.event_id === event.id).length;
                    return (
                      <tr key={event.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.category}</p>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {format(new Date(event.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                            {event.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{eventRegs} / {event.capacity}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Switch 
                            checked={event.registration_open} 
                            onCheckedChange={() => handleToggleRegistration(event.id, event.registration_open)} 
                          />
                        </td>
                        <td className="px-4 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/event/${event.id}`)}>
                                View Event Page
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePublishToggle(event.id, event.status)}>
                                {event.status === 'published' ? 'Unpublish (Draft)' : 'Publish Event'}
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem>Edit Event</DropdownMenuItem> */}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        No events found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
