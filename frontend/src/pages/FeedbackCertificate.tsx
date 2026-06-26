import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Star, Download, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function FeedbackCertificate() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { getEventById, getRegistration, getUserCertificates } = useEvents();
  const { profile } = useAuth();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  const event = eventId ? getEventById(eventId) : null;
  const registration = profile && eventId ? getRegistration(profile.id, eventId) : null;

  if (!event || !registration) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <h2 className="text-xl">Event or Registration not found</h2>
      </div>
    );
  }

  if (!registration.attended) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-warning/50 bg-warning/5">
          <CardContent className="p-6">
            <div className="w-16 h-16 bg-warning/20 text-warning rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Not Checked In</h2>
            <p className="text-muted-foreground mb-4">You can only submit feedback and claim a certificate if you attended the event.</p>
            <Button onClick={() => navigate('/profile')}>Back to Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulate API call for feedback submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would generate a PDF or return a URL to a real certificate
      // We will simulate getting a certificate
      setCertificateUrl(`https://dummyimage.com/800x600/f3f4f6/4f46e5.png&text=Certificate+of+Participation:+${event.title.replace(/ /g, '+')}`);
      setSubmitted(true);
      toast.success('Feedback submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-2xl mx-auto">
        {!submitted ? (
          <Card className="border-primary/20 shadow-xl">
            <CardHeader className="text-center pb-2">
              <Award className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Event Feedback</CardTitle>
              <CardDescription>
                Please share your experience at <span className="font-semibold text-foreground">{event.title}</span> to unlock your certificate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-center">
                  <Label className="text-base">How would you rate this event?</Label>
                  <div className="flex justify-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          className={`w-10 h-10 ${
                            (hoverRating || rating) >= star 
                              ? 'fill-warning text-warning' 
                              : 'text-muted stroke-muted-foreground/30'
                          } transition-colors`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Any comments or suggestions? (Optional)</Label>
                  <Textarea 
                    rows={4}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you liked and what we can improve..."
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12" 
                  disabled={submitting || rating === 0}
                >
                  {submitting ? 'Submitting...' : 'Submit & Claim Certificate'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-success/30 shadow-xl overflow-hidden">
            <div className="bg-success text-success-foreground p-6 text-center">
              <Award className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Congratulations!</h2>
              <p>Your certificate is ready to download.</p>
            </div>
            <CardContent className="p-8 text-center space-y-6">
              <div className="border-4 border-double border-muted rounded-xl p-2 relative group cursor-pointer" onClick={() => window.open(certificateUrl!, '_blank')}>
                <img src={certificateUrl!} alt="Certificate" className="w-full rounded-lg" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-semibold flex items-center gap-2"><Download className="w-5 h-5" /> Click to enlarge</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button className="w-full" onClick={() => {
                  const link = document.createElement('a');
                  link.href = certificateUrl!;
                  link.download = `Certificate_${event.title.replace(/\s+/g, '_')}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                  <Download className="w-4 h-4 mr-2" /> Download Image
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                  Back to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
