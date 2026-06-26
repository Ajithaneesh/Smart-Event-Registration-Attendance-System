import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  Building2, 
  ArrowLeft, 
  Loader2, 
  Copy, 
  Check,
  Search,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function MessagesPage() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');

  const [partners, setPartners] = useState<any[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [partnerSearchTerm, setPartnerSearchTerm] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch chat partners (faculty members + any active conversations)
  useEffect(() => {
    if (!profile) return;

    async function fetchPartners() {
      try {
        setLoadingPartners(true);

        // Fetch all faculty/admin profiles
        const { data: facultyData, error: facError } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['admin', 'faculty']);

        if (facError) throw facError;

        // Fetch user ids from existing messages
        const { data: msgHistory, error: msgError } = await supabase
          .from('messages')
          .select('sender_id, receiver_id')
          .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`);

        if (msgError) throw msgError;

        const chatPartnerIds = Array.from(
          new Set(
            (msgHistory || []).flatMap((m) => [m.sender_id, m.receiver_id])
          )
        ).filter((id) => id && id !== profile.id);

        let mergedPartners = [...(facultyData || [])];

        // Fetch other users who aren't in faculty list but have messages
        const missingIds = chatPartnerIds.filter(
          (id) => !mergedPartners.some((p) => p.id === id)
        );

        if (missingIds.length > 0) {
          const { data: missingData, error: missError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', missingIds);

          if (!missError && missingData) {
            mergedPartners = [...mergedPartners, ...missingData];
          }
        }

        // Sort by role (faculty/admin first) and then by name
        mergedPartners.sort((a, b) => {
          if (a.role !== b.role) {
            return a.role === 'student' ? 1 : -1;
          }
          return (a.full_name || '').localeCompare(b.full_name || '');
        });

        setPartners(mergedPartners);

        // Fetch unread messages count
        const { data: unreadData, error: unreadError } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('receiver_id', profile.id)
          .eq('read', false);

        if (!unreadError && unreadData) {
          const counts: Record<string, number> = {};
          unreadData.forEach((msg) => {
            if (msg.sender_id) {
              counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
            }
          });
          setUnreadCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching chat partners:', err);
        toast.error('Failed to load contacts');
      } finally {
        setLoadingPartners(false);
      }
    }

    fetchPartners();
  }, [profile]);

  // 2. Handle ?userId= query param
  useEffect(() => {
    if (loadingPartners || !targetUserId || !profile) return;

    const existingPartner = partners.find((p) => p.id === targetUserId);
    if (existingPartner) {
      setSelectedFaculty(existingPartner);
    } else {
      // Fetch missing partner directly
      supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setPartners((prev) => [data, ...prev]);
            setSelectedFaculty(data);
          }
        });
    }
  }, [targetUserId, loadingPartners, partners, profile]);

  // 3. Load messages when selectedFaculty changes
  useEffect(() => {
    if (!profile || !selectedFaculty) {
      setMessages([]);
      return;
    }

    const partnerId = selectedFaculty.id;
    setLoadingMessages(true);

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${profile.id})`)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);

        // Mark messages as read in DB
        await supabase
          .from('messages')
          .update({ read: true })
          .eq('sender_id', partnerId)
          .eq('receiver_id', profile.id)
          .eq('read', false);

        // Update local unread state
        setUnreadCounts((prev) => {
          const updated = { ...prev };
          delete updated[partnerId];
          return updated;
        });
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages in realtime
    const channel = supabase
      .channel(`chat-room-${profile.id}-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === profile.id && newMsg.receiver_id === partnerId) ||
            (newMsg.sender_id === partnerId && newMsg.receiver_id === profile.id)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            // Mark incoming message as read
            if (newMsg.receiver_id === profile.id) {
              supabase
                .from('messages')
                .update({ read: true })
                .eq('id', newMsg.id)
                .then();
            }
          }
        }
      )
      .subscribe();

    // Polling fallback to guarantee delivery
    const pollInterval = setInterval(() => {
      supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${profile.id})`)
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (!error && data) {
            setMessages(data);
          }
        });
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [selectedFaculty, profile]);

  // 4. Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 5. Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedFaculty || !newMessageText.trim()) return;

    const content = newMessageText.trim();
    setNewMessageText(''); // Optimistic clear

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: profile.id,
            receiver_id: selectedFaculty.id,
            content,
            read: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  const handleCopyPhone = (phone: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    toast.success('Phone number copied!');
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Helper date functions
  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const filteredPartners = partners.filter((p) =>
    p.full_name?.toLowerCase().includes(partnerSearchTerm.toLowerCase()) ||
    p.department?.toLowerCase().includes(partnerSearchTerm.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Communicate with faculty members and event coordinators.</p>
        </div>

        <div className="flex h-[75vh] w-full rounded-2xl border border-border bg-card overflow-hidden shadow-lg relative">
          
          {/* LEFT PANEL - Conversations List */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col shrink-0 bg-card ${selectedFaculty ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-9 bg-muted/40"
                  value={partnerSearchTerm}
                  onChange={(e) => setPartnerSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {loadingPartners ? (
                  <div className="space-y-2 p-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-muted rounded w-3/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPartners.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No contacts found.
                  </div>
                ) : (
                  filteredPartners.map((partner) => {
                    const isSelected = selectedFaculty?.id === partner.id;
                    const unreadCount = unreadCounts[partner.id] || 0;
                    return (
                      <button
                        key={partner.id}
                        onClick={() => {
                          setSelectedFaculty(partner);
                          setSearchParams({ userId: partner.id });
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left hover:bg-muted/60 relative group ${
                          isSelected ? 'bg-primary/10 hover:bg-primary/15 border border-primary/20' : 'border border-transparent'
                        }`}
                      >
                        <Avatar className="w-10 h-10 border border-border">
                          <AvatarImage src={partner.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {partner.full_name?.charAt(0) || 'F'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                              {partner.full_name}
                            </span>
                            {unreadCount > 0 && (
                              <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-[11px] text-muted-foreground truncate max-w-[80%]">
                              {partner.role === 'admin' ? 'Administrator' : 'Faculty'}
                            </span>
                            {partner.department && (
                              <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground max-w-[60px] truncate">
                                {partner.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT PANEL - Chat Window */}
          <div className={`flex-1 flex flex-col h-full bg-card/40 ${selectedFaculty ? 'flex' : 'hidden md:flex'}`}>
            {selectedFaculty ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-card flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => {
                        setSelectedFaculty(null);
                        setSearchParams({});
                      }}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <Avatar className="w-10 h-10 border border-primary/20">
                      <AvatarImage src={selectedFaculty.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {selectedFaculty.full_name?.charAt(0) || 'F'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-semibold text-sm text-foreground truncate max-w-[150px] sm:max-w-xs">
                          {selectedFaculty.full_name}
                        </h2>
                        {selectedFaculty.role === 'admin' && (
                          <span className="text-[9px] bg-red-500/10 text-red-500 font-bold px-1 py-0.2 rounded border border-red-500/20">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {selectedFaculty.department || (selectedFaculty.role === 'admin' ? 'Administration' : 'Faculty')}
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2">
                    {selectedFaculty.phone && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Copy Phone Number"
                          onClick={(e) => handleCopyPhone(selectedFaculty.phone, selectedFaculty.id, e)}
                        >
                          {copiedPhoneId === selectedFaculty.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 text-primary hover:bg-primary/10"
                          title="Call Faculty"
                          asChild
                        >
                          <a href={`tel:${selectedFaculty.phone}`}>
                            <Phone className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    )}
                    {selectedFaculty.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Send Email"
                        asChild
                      >
                        <a href={`mailto:${selectedFaculty.email}`}>
                          <Mail className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-hidden relative bg-muted/5">
                  <ScrollArea className="h-full p-4">
                    {loadingMessages && messages.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <MessageSquare className="w-12 h-12 mb-4 text-muted-foreground/45" />
                        <h3 className="text-base font-semibold text-foreground">No messages yet</h3>
                        <p className="text-xs max-w-[250px] mt-1">
                          Start a conversation by typing a message below.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          let lastDate: string | null = null;
                          return messages.map((msg) => {
                            const msgDate = new Date(msg.created_at).toDateString();
                            const showDateSeparator = msgDate !== lastDate;
                            lastDate = msgDate;

                            const isOwn = msg.sender_id === profile?.id;

                            return (
                              <div key={msg.id} className="space-y-2">
                                {showDateSeparator && (
                                  <div className="flex justify-center my-4">
                                    <span className="bg-muted px-3 py-1 rounded-full text-[10px] font-medium text-muted-foreground shadow-sm">
                                      {formatMessageDate(msg.created_at)}
                                    </span>
                                  </div>
                                )}
                                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                                  <div
                                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 hover:shadow ${
                                      isOwn
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted text-foreground rounded-tl-none border border-border/40'
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed select-text">
                                      {msg.content}
                                    </p>
                                    <span
                                      className={`text-[9px] block text-right mt-1.5 font-medium ${
                                        isOwn ? 'text-primary-foreground/75' : 'text-muted-foreground'
                                      }`}
                                    >
                                      {new Date(msg.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Message Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t border-border bg-card flex gap-2 items-center"
                >
                  <Input
                    placeholder="Type your message..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 bg-muted/40 focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <Button type="submit" size="icon" className="shrink-0 h-10 w-10">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              // Empty State (no active chat selected)
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Select a Chat</h3>
                <p className="text-sm text-muted-foreground max-w-sm mt-1">
                  Choose a faculty member from the list to start chatting. You can also contact them via phone or email.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
