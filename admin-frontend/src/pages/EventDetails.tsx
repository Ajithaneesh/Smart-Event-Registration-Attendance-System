import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Ticket, Heart, Share2, Bell, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEventById, getRegistrationsByEvent, favorites, toggleFavorite, profile, getEventAnnouncements } = useEvents();
  const [activeTab, setActiveTab] = useState('details');

  const event = id ? getEventById(id) : null;
  const announcements = id ? getEventAnnouncements(id) : [];
  
  if (!event) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-background">
        <AlertCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Button>
      </div>
    );
  }

  const isFav = profile ? favorites.some(f => f.event_id === event.id) : false;
  const regs = getRegistrationsByEvent(event.id);
  const isRegistered = profile ? regs.some(r => r.user_id === profile.id) : false;
  const spotsLeft = Math.max(0, event.capacity - regs.length);
  const isFull = spotsLeft === 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Event Header Banner */}
      <div className="w-full h-64 md:h-80 relative overflow-hidden bg-muted">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Calendar className="w-24 h-24 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge variant="default" className="bg-primary text-primary-foreground">{event.category}</Badge>
                {event.is_paid && <Badge variant="destructive">Paid (₹{event.price})</Badge>}
                {event.status === 'cancelled' && <Badge variant="destructive">Cancelled</Badge>}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground">{event.title}</h1>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="bg-background/50 backdrop-blur-sm border-border/50">
                <Share2 className="w-5 h-5 text-foreground" />
              </Button>
              {profile && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="bg-background/50 backdrop-blur-sm border-border/50"
                  onClick={() => toggleFavorite(profile.id, event.id)}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">Overview</TabsTrigger>
              <TabsTrigger value="announcements" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3">
                Announcements
                {announcements.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                    {announcements.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="pt-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">About this event</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {event.description || 'No description provided.'}
                </p>
              </div>
              
              <Separator />

              <div>
                <h3 className="text-xl font-bold mb-4">Speakers & Faculty</h3>
                {/* Fallback to created_by if event_faculty isn't populated for some reason */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                    <Avatar className="h-12 w-12 border">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">FA</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">Faculty Coordinator</p>
                      <p className="text-sm text-muted-foreground">Main Organizer</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="announcements" className="pt-6 space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                  <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No announcements yet.</p>
                </div>
              ) : (
                announcements.map((ann, i) => (
                  <Card key={ann.id || i} className={ann.priority === 'urgent' ? 'border-destructive/50 bg-destructive/5' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{ann.title}</CardTitle>
                        {ann.priority === 'urgent' && <Badge variant="destructive">Urgent</Badge>}
                        {ann.priority === 'high' && <Badge variant="default">High Priority</Badge>}
                      </div>
                      <CardDescription>{format(new Date(ann.created_at), 'MMM dd, yyyy • hh:mm a')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm">{ann.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Registration Card */}
        <div className="space-y-6">
          <Card className="sticky top-24 border-primary/20 shadow-lg shadow-primary/5">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-muted-foreground">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</p>
                    <p className="text-sm">{event.time} {event.end_time ? `- ${event.end_time}` : ''}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{event.venue}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 text-muted-foreground">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{event.participation_type} Participation</p>
                    <p className="text-sm">{event.participation_type === 'Team' ? `Max ${event.max_team_size} members` : 'Individual entry'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Available Spots</span>
                  <span className="font-bold text-lg">{spotsLeft} / {event.capacity}</span>
                </div>
                
                {isRegistered ? (
                  <Button className="w-full" variant="secondary" onClick={() => navigate(`/ticket/${regs.find(r => r.user_id === profile?.id)?.id}`)}>
                    <Ticket className="w-4 h-4 mr-2" /> View Ticket
                  </Button>
                ) : event.status === 'cancelled' ? (
                  <Button className="w-full" variant="destructive" disabled>Event Cancelled</Button>
                ) : !event.registration_open ? (
                  <Button className="w-full" variant="secondary" disabled>Registration Closed</Button>
                ) : isFull ? (
                  <Button className="w-full" variant="secondary" disabled>Event Full</Button>
                ) : (
                  <Button 
                    className="w-full text-lg h-12" 
                    onClick={() => navigate(`/register/${event.id}`)}
                  >
                    Register Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
