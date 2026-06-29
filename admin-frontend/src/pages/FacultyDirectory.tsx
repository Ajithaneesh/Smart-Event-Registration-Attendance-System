import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Mail, Phone, Building2, Search, MessageSquare, Copy, Check } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function FacultyDirectory() {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFaculty() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['admin', 'faculty']);
          
        if (error) throw error;
        setFaculty(data || []);
      } catch (err) {
        console.error('Error fetching faculty:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFaculty();
  }, []);

  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    toast.success("Phone number copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFaculty = faculty.filter(f => 
    f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Faculty Directory</h1>
            <p className="text-muted-foreground mt-1">Connect with event coordinators and department heads.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search faculty..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-40" />
              </Card>
            ))}
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl bg-muted/10">
            No faculty members found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map(member => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow border-border/60 flex flex-col justify-between">
                <CardContent className="p-6 flex flex-col h-full justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 border-2 border-primary/20 shrink-0">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {member.full_name?.charAt(0) || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold truncate text-foreground">{member.full_name}</h3>
                      <p className="text-sm font-medium text-primary mb-2">
                        {member.role === 'admin' ? 'Administrator' : 'Faculty Member'}
                      </p>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {member.department && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{member.department}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1.5 group/phone relative">
                            <a 
                              href={`tel:${member.phone}`} 
                              className="flex items-center gap-2 hover:text-primary hover:underline transition-colors truncate"
                            >
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{member.phone}</span>
                            </a>
                            <button 
                              onClick={(e) => handleCopyPhone(member.id, member.phone, e)}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors ml-1 inline-flex items-center justify-center"
                              title="Copy Phone Number"
                            >
                              {copiedId === member.id ? (
                                <Check className="w-3 text-green-500 shrink-0" />
                              ) : (
                                <Copy className="w-3 shrink-0" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/60 mt-6 pt-4 flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1.5"
                      onClick={() => navigate(`/messages?userId=${member.id}`)}
                    >
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span>Chat</span>
                    </Button>
                    {member.phone && (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="gap-1.5 px-3 shrink-0"
                        asChild
                      >
                        <a href={`tel:${member.phone}`} title="Call Faculty">
                          <Phone className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
