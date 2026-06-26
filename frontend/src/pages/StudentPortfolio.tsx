import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Award, Calendar, CheckCircle2, FileText, Download, Ticket } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentPortfolio() {
  const { profile, updateProfile } = useAuth();
  const { getRegistrationsByUser, events, getUserCertificates } = useEvents();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    student_id: '',
    department: '',
    year: '',
    phone: ''
  });

  const [certificates, setCertificates] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        student_id: profile.student_id || '',
        department: profile.department || '',
        year: profile.year || '',
        phone: profile.phone || ''
      });

      getUserCertificates(profile.id).then(setCertificates);
    }
  }, [profile, getUserCertificates]);

  if (!profile) return null;

  const myRegistrations = getRegistrationsByUser(profile.id);
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/20">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary">{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Award className="w-4 h-4" />
                {myRegistrations.length} Events Registered
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label>Student ID / Roll No</Label>
                    <Input value={editForm.student_id} onChange={e => setEditForm({...editForm, student_id: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Study</Label>
                    <Input value={editForm.year} onChange={e => setEditForm({...editForm, year: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                  <Button className="w-full" onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Student ID</p>
                    <p className="font-medium">{profile.student_id || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{profile.department || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{profile.year || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="events">My Events</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="mt-6 space-y-4">
              {myRegistrations.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">No events registered yet</p>
                    <Button variant="outline" onClick={() => navigate('/')}>Explore Events</Button>
                  </CardContent>
                </Card>
              ) : (
                myRegistrations.map(reg => {
                  const event = events.find(e => e.id === reg.event_id);
                  if (!event) return null;
                  const isPast = new Date(`${event.date}T${event.end_time || '23:59:00'}`) < new Date();

                  return (
                    <Card key={reg.id} className={`overflow-hidden ${isPast ? 'opacity-80 bg-muted/30' : ''}`}>
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/4 bg-primary/5 p-4 flex flex-col justify-center items-center text-center border-b sm:border-b-0 sm:border-r border-border">
                          <p className="text-sm font-bold text-primary uppercase">{format(new Date(event.date), 'MMM')}</p>
                          <p className="text-3xl font-extrabold">{format(new Date(event.date), 'dd')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                        </div>
                        <div className="flex-1 p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{event.title}</h3>
                              {reg.attended && <CheckCircle2 className="w-4 h-4 text-success" />}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{event.venue}</p>
                            <div className="flex items-center gap-2">
                              {reg.payment_status === 'paid' && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success/20 text-success">Paid</span>
                              )}
                              {reg.payment_status === 'pending' && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-warning/20 text-warning">Payment Pending</span>
                              )}
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary/20 text-secondary">{event.participation_type}</span>
                            </div>
                          </div>
                          
                          <div className="w-full sm:w-auto flex flex-col gap-2">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate(`/ticket/${reg.id}`)}>
                              <Ticket className="w-4 h-4 mr-2" /> View Ticket
                            </Button>
                            {isPast && reg.attended && !certificates.find(c => c.event_id === event.id) && (
                              <Button className="w-full sm:w-auto bg-success text-success-foreground hover:bg-success/90" onClick={() => navigate(`/feedback/${event.id}`)}>
                                Claim Certificate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="certificates" className="mt-6">
              {certificates.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">No certificates yet</p>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm">Attend events and submit feedback to earn certificates.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {certificates.map(cert => {
                    const event = events.find(e => e.id === cert.event_id);
                    return (
                      <Card key={cert.id} className="overflow-hidden group cursor-pointer" onClick={() => window.open(cert.certificate_url, '_blank')}>
                        <div className="aspect-[4/3] bg-muted relative border-b">
                          <img src={cert.certificate_url} alt="Certificate" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Download className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold line-clamp-1">{event?.title || 'Event Certificate'}</h4>
                          <p className="text-xs text-muted-foreground mt-1">Issued {format(new Date(cert.issued_at), 'MMM dd, yyyy')}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
