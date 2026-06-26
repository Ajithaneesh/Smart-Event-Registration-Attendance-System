import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Calendar, MapPin, Download, Share2, Award, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export default function TicketPage() {
  const { regId } = useParams<{ regId: string }>();
  const navigate = useNavigate();
  const { registrations, events } = useEvents();
  const { profile } = useAuth();

  const registration = registrations.find(r => r.id === regId);
  const event = registration ? events.find(e => e.id === registration.event_id) : null;

  if (!registration || !event) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold mb-4">Ticket Not Found</h2>
        <Button onClick={() => navigate('/profile')}>Go to Profile</Button>
      </div>
    );
  }

  // Ensure user can only view their own ticket (unless admin)
  if (profile?.role !== 'admin' && profile?.id !== registration.user_id) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center bg-background">
        <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const handleDownload = () => {
    toast.success('Downloading ticket...');
    window.print(); // Simple way to save as PDF for now
  };

  const isEventOver = new Date(`${event.date}T${event.end_time || '23:59:00'}`) < new Date();

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center no-print">
          <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard!');
            }}>
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>

        {/* The Ticket */}
        <div id="ticket-container" className="relative group perspective-1000">
          <Card className="overflow-hidden border-2 border-primary/20 bg-card shadow-2xl relative">
            
            {/* Design accents */}
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-secondary to-primary"></div>
            <div className="absolute -left-6 top-1/2 w-12 h-12 bg-background rounded-full border-r-2 border-primary/20"></div>
            <div className="absolute -right-6 top-1/2 w-12 h-12 bg-background rounded-full border-l-2 border-primary/20"></div>
            <div className="absolute left-6 right-6 top-1/2 border-t-2 border-dashed border-border"></div>

            <CardContent className="p-0">
              {/* Upper Section: Event Info */}
              <div className="p-8 pb-12 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <Badge className="mb-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">
                      {event.category}
                    </Badge>
                    <h1 className="text-3xl font-extrabold text-foreground leading-tight">
                      {event.title}
                    </h1>
                  </div>

                  <div className="space-y-2 mt-4 text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>{event.time} {event.end_time ? `- ${event.end_time}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col items-center justify-center p-4 bg-white rounded-2xl border shadow-sm">
                  <QRCodeSVG 
                    value={registration.ticket_id} 
                    size={140}
                    level="H"
                    includeMargin={true}
                  />
                  <p className="mt-2 font-mono text-sm text-center font-bold tracking-widest text-black">
                    {registration.ticket_id}
                  </p>
                </div>
              </div>

              {/* Lower Section: Attendee Info */}
              <div className="p-8 pt-12 bg-muted/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Attendee</p>
                    <p className="font-bold text-foreground truncate">{registration.profiles?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Type</p>
                    <p className="font-bold text-foreground">{event.participation_type}</p>
                  </div>
                  {event.participation_type === 'Team' && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Team Name</p>
                      <p className="font-bold text-foreground truncate">{registration.team_name || 'N/A'}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Status</p>
                    <Badge variant={registration.attended ? "default" : "secondary"} className={registration.attended ? "bg-success hover:bg-success" : ""}>
                      {registration.attended ? 'Checked In' : 'Valid'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Payment</p>
                    <Badge variant={registration.payment_status === 'paid' ? "default" : registration.payment_status === 'pending' ? "warning" : "secondary"}>
                      {registration.payment_status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action area for Feedback/Certificate */}
        {registration.attended && isEventOver && (
          <Card className="mt-8 border-success/30 bg-success/5 no-print">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Event Completed</h3>
                  <p className="text-sm text-muted-foreground">Thank you for attending! Please provide feedback to get your certificate.</p>
                </div>
              </div>
              <Button onClick={() => navigate(`/feedback/${event.id}`)} className="bg-success text-success-foreground hover:bg-success/90">
                Claim Certificate
              </Button>
            </CardContent>
          </Card>
        )}

        <style>{`
          @media print {
            body * { visibility: hidden; }
            #ticket-container, #ticket-container * { visibility: visible; }
            #ticket-container { position: absolute; left: 0; top: 0; width: 100%; margin: 0; }
            .no-print { display: none !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
