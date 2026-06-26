import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';

export default function Register() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { getEventById, getEventFormFields, registerForEvent, getRegistration } = useEvents();
  const { profile } = useAuth();
  
  const [event, setEvent] = useState<any>(null);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Base Form State
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  
  // Custom Fields State
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});
  
  // Payment State
  const [paymentId, setPaymentId] = useState('');
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'processing' | 'verified' | 'error'>('idle');

  useEffect(() => {
    async function loadData() {
      if (!eventId) return;
      const evt = getEventById(eventId);
      if (!evt) {
        navigate('/');
        return;
      }
      setEvent(evt);
      
      // Initialize team members array based on max size
      if (evt.participation_type === 'Team') {
        setTeamMembers(Array((evt.max_team_size || 2) - 1).fill(''));
      }

      try {
        const fields = await getEventFormFields(eventId);
        setFormFields(fields);
        
        // Initialize custom responses
        const initResponses: Record<string, any> = {};
        fields.forEach(f => {
          if (f.field_type === 'checkbox') {
            initResponses[f.id] = [];
          } else {
            initResponses[f.id] = '';
          }
        });
        setCustomResponses(initResponses);
      } catch (err) {
        toast.error('Failed to load form fields');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [eventId, getEventById, getEventFormFields, navigate]);

  useEffect(() => {
    if (event?.is_paid && !window.Tesseract) {
      const script = document.createElement('script');
      script.src = "https://unpkg.com/tesseract.js@4.0.1/dist/tesseract.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [event]);

  if (loading || !event) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center">
        <div className="w-full max-w-2xl h-[600px] rounded-xl bg-muted animate-pulse"></div>
      </div>
    );
  }

  // Already registered check
  if (profile && getRegistration(profile.id, event.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center p-6">
          <CardHeader>
            <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
            </div>
            <CardTitle>Already Registered</CardTitle>
            <CardDescription>You have already secured your spot for this event.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate(`/ticket/${getRegistration(profile.id, event.id)?.id}`)}>
              View Ticket
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleCustomResponseChange = (fieldId: string, value: any) => {
    setCustomResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    setCustomResponses(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter((item: string) => item !== option) };
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !window.Tesseract) return;
    
    setOcrStatus('processing');
    try {
      const result = await window.Tesseract.recognize(file, 'eng');
      const text = result.data.text.toLowerCase();
      
      const isVerified = text.includes('successful') || 
                         text.includes('paid to') || 
                         text.includes('transaction id');
      
      if (isVerified) {
        setOcrStatus('verified');
        toast.success('Payment verified successfully!');
      } else {
        setOcrStatus('error');
        toast.error('Could not verify payment from image. Please ensure it is a valid receipt.');
      }
    } catch (err) {
      setOcrStatus('error');
      toast.error('OCR Processing failed');
    }
  };

  const validateForm = () => {
    for (const field of formFields) {
      if (field.is_required) {
        const val = customResponses[field.id];
        if (field.field_type === 'checkbox' && (!val || val.length === 0)) {
          toast.error(`Please select at least one option for ${field.field_name}`);
          return false;
        }
        if (!val || val === '') {
          toast.error(`Please fill out ${field.field_name}`);
          return false;
        }
      }
    }
    
    if (event.participation_type === 'Team') {
      if (!teamName) {
        toast.error('Please provide a team name');
        return false;
      }
      for (let i = 0; i < teamMembers.length; i++) {
        if (!teamMembers[i]) {
          toast.error(`Please provide details for Team Member ${i+2}`);
          return false;
        }
      }
    }

    if (event.is_paid) {
      if (!paymentId) {
        toast.error('Please enter the transaction ID');
        return false;
      }
      if (ocrStatus !== 'verified') {
        toast.error('Please upload a valid payment screenshot');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const userData = {
        payment_status: event.is_paid ? 'pending' : 'free',
        payment_id: paymentId,
        team_name: teamName,
        team_members: teamMembers.filter(m => m !== '')
      };

      const reg = await registerForEvent(profile.id, event.id, userData, customResponses);
      toast.success('Registration successful!');
      navigate(`/ticket/${reg.id}`);
    } catch (err: any) {
      toast.error('Registration failed: ' + err.message);
      setSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <Input 
            type={field.field_type} 
            value={customResponses[field.id] || ''} 
            onChange={e => handleCustomResponseChange(field.id, e.target.value)}
            placeholder={`Enter ${field.field_name}`}
            className="w-full"
          />
        );
      case 'textarea':
        return (
          <Textarea 
            value={customResponses[field.id] || ''} 
            onChange={e => handleCustomResponseChange(field.id, e.target.value)}
            placeholder={`Enter ${field.field_name}`}
          />
        );
      case 'select':
        return (
          <Select 
            value={customResponses[field.id] || ''} 
            onValueChange={v => handleCustomResponseChange(field.id, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.field_name}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((opt: string) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'radio':
        return (
          <RadioGroup 
            value={customResponses[field.id] || ''} 
            onValueChange={v => handleCustomResponseChange(field.id, v)}
          >
            {field.options?.map((opt: string) => (
              <div key={opt} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                <Label htmlFor={`${field.id}-${opt}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((opt: string) => (
              <div key={opt} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${field.id}-${opt}`} 
                  checked={(customResponses[field.id] || []).includes(opt)}
                  onCheckedChange={(c) => handleCheckboxChange(field.id, opt, c as boolean)}
                />
                <Label htmlFor={`${field.id}-${opt}`}>{opt}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-3xl mx-auto">
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="bg-muted/50 border-b">
            <CardTitle className="text-2xl">Registration: {event.title}</CardTitle>
            <CardDescription>{format(new Date(event.date), 'MMMM dd, yyyy')} at {event.time}</CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Profile Read-only Data */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{profile?.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Custom Fields */}
              {formFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                  {formFields.map(field => (
                    <div key={field.id} className="space-y-2">
                      <Label className={field.is_required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                        {field.field_name}
                      </Label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}

              {/* Team Registration */}
              {event.participation_type === 'Team' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Team Details</h3>
                  <div className="space-y-2">
                    <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Team Name</Label>
                    <Input 
                      value={teamName} 
                      onChange={e => setTeamName(e.target.value)} 
                      placeholder="Enter team name"
                    />
                  </div>
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="space-y-2">
                      <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Team Member {idx + 2} Email/ID</Label>
                      <Input 
                        value={member} 
                        onChange={e => {
                          const newMembers = [...teamMembers];
                          newMembers[idx] = e.target.value;
                          setTeamMembers(newMembers);
                        }} 
                        placeholder="Enter email or student ID"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Payment Section */}
              {event.is_paid && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold border-b pb-2">Payment Verification</h3>
                  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-destructive">Registration Fee</p>
                      <p className="text-2xl font-bold text-destructive">₹{event.price}</p>
                    </div>
                    {event.upi_id && (
                      <div className="text-right">
                        <p className="text-sm font-medium mb-1">Scan to Pay</p>
                        <div className="bg-white p-2 rounded-lg inline-block">
                          <QRCodeSVG value={`upi://pay?pa=${event.upi_id}&pn=College&am=${event.price}`} size={100} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{event.upi_id}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 bg-muted/50 p-4 rounded-xl border">
                    <div className="space-y-2">
                      <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Upload Payment Screenshot</Label>
                      <Input type="file" accept="image/*" onChange={handleImageUpload} />
                      {ocrStatus === 'processing' && <p className="text-sm text-blue-500 animate-pulse">Verifying payment receipt...</p>}
                      {ocrStatus === 'verified' && <p className="text-sm text-success font-medium">✓ Receipt verified automatically</p>}
                      {ocrStatus === 'error' && <p className="text-sm text-destructive font-medium">⚠️ Automatic verification failed. Admin will verify manually.</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Transaction ID</Label>
                      <Input 
                        value={paymentId} 
                        onChange={e => setPaymentId(e.target.value)} 
                        placeholder="Enter UPI Transaction / Reference ID"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <Button 
                type="submit" 
                className="w-full h-12 text-lg" 
                disabled={submitting || (event.is_paid && !paymentId)}
              >
                {submitting ? 'Processing Registration...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
