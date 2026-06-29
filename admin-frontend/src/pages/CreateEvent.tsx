import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { addEvent, saveFormFields } = useEvents();
  const [submitting, setSubmitting] = useState(false);

  // Basic Event State
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    category: 'Tech',
    date: '',
    time: '',
    end_time: '',
    venue: '',
    capacity: 100,
    image_url: '',
    participation_type: 'Solo',
    max_team_size: 2,
    is_paid: false,
    price: 0,
    upi_id: '',
    registration_open: true,
  });

  // Dynamic Form Builder State
  const [formFields, setFormFields] = useState<any[]>([]);

  const addField = () => {
    setFormFields([...formFields, {
      id: `new-${Date.now()}`,
      field_name: '',
      field_type: 'text',
      is_required: true,
      options: [],
      display_order: formFields.length
    }]);
  };

  const removeField = (index: number) => {
    const newFields = [...formFields];
    newFields.splice(index, 1);
    setFormFields(newFields);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...formFields];
    newFields[index][key] = value;
    setFormFields(newFields);
  };

  const updateFieldOptions = (index: number, optionsStr: string) => {
    const options = optionsStr.split(',').map(s => s.trim()).filter(s => s !== '');
    updateField(index, 'options', options);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventData.title || !eventData.date || !eventData.time || !eventData.venue) {
      toast.error('Please fill in all required basic event details');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Event
      const newEvent = await addEvent({
        ...eventData,
        status: 'published'
      });

      // 2. Save Form Fields if any
      if (formFields.length > 0) {
        // Remove the temporary 'id' from the objects before sending
        const cleanFields = formFields.map(f => {
          const { id, ...rest } = f;
          return rest;
        });
        await saveFormFields(newEvent.id, cleanFields);
      }

      toast.success('Event created successfully!');
      navigate('/admin');
    } catch (err: any) {
      toast.error('Failed to create event: ' + err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <Button variant="outline" onClick={() => navigate('/admin')}>Cancel</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label>Event Title *</Label>
                <Input value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} required />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})} rows={4} />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={eventData.category} onValueChange={v => setEventData({...eventData, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tech">Tech</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Venue *</Label>
                <Input value={eventData.venue} onChange={e => setEventData({...eventData, venue: e.target.value})} required />
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} required />
              </div>

              <div className="space-y-2 flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Start Time *</Label>
                  <Input type="time" value={eventData.time} onChange={e => setEventData({...eventData, time: e.target.value})} required />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" value={eventData.end_time} onChange={e => setEventData({...eventData, end_time: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" value={eventData.capacity} onChange={e => setEventData({...eventData, capacity: parseInt(e.target.value)})} />
              </div>

              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input value={eventData.image_url} onChange={e => setEventData({...eventData, image_url: e.target.value})} placeholder="https://..." />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Registration Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Registration & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Participation Type</Label>
                <Select value={eventData.participation_type} onValueChange={v => setEventData({...eventData, participation_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solo">Solo (Individual)</SelectItem>
                    <SelectItem value="Team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {eventData.participation_type === 'Team' && (
                <div className="space-y-2">
                  <Label>Max Team Size</Label>
                  <Input type="number" min={2} value={eventData.max_team_size} onChange={e => setEventData({...eventData, max_team_size: parseInt(e.target.value)})} />
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg md:col-span-2">
                <div className="space-y-0.5">
                  <Label>Paid Event</Label>
                  <p className="text-sm text-muted-foreground">Charge an entry fee for this event.</p>
                </div>
                <Switch checked={eventData.is_paid} onCheckedChange={c => setEventData({...eventData, is_paid: c})} />
              </div>

              {eventData.is_paid && (
                <>
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" value={eventData.price} onChange={e => setEventData({...eventData, price: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>UPI ID for Payments</Label>
                    <Input value={eventData.upi_id} onChange={e => setEventData({...eventData, upi_id: e.target.value})} placeholder="college@upi" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Dynamic Form Builder */}
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Registration Form Builder</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Add custom fields to collect specific information during registration.</p>
              </div>
              <Button type="button" onClick={addField} variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Field
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formFields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  No custom fields added. Default fields (Name, Email) are always included.
                </div>
              ) : (
                formFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                    <div className="mt-2 text-muted-foreground cursor-grab">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-4 space-y-2">
                        <Label>Field Label</Label>
                        <Input value={field.field_name} onChange={e => updateField(index, 'field_name', e.target.value)} placeholder="e.g. T-Shirt Size" />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label>Type</Label>
                        <Select value={field.field_type} onValueChange={v => updateField(index, 'field_type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Short Text</SelectItem>
                            <SelectItem value="textarea">Long Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Dropdown</SelectItem>
                            <SelectItem value="radio">Radio Buttons</SelectItem>
                            <SelectItem value="checkbox">Checkboxes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3 space-y-2 flex items-center h-full pt-6">
                        <div className="flex items-center space-x-2">
                          <Switch id={`req-${index}`} checked={field.is_required} onCheckedChange={c => updateField(index, 'is_required', c)} />
                          <Label htmlFor={`req-${index}`}>Required</Label>
                        </div>
                      </div>
                      
                      {['select', 'radio', 'checkbox'].includes(field.field_type) && (
                        <div className="md:col-span-12 space-y-2 mt-2">
                          <Label>Options (comma separated)</Label>
                          <Input 
                            value={field.options?.join(', ') || ''} 
                            onChange={e => updateFieldOptions(index, e.target.value)} 
                            placeholder="e.g. Small, Medium, Large" 
                          />
                        </div>
                      )}
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive mt-6" onClick={() => removeField(index)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin')}>Cancel</Button>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Creating Event...' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
