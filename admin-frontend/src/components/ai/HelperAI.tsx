import { useState, useRef, useEffect } from 'react';
import { useEvents } from '../../context/EventContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bot, X, Send, Sparkles, User, Calendar, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: 'navigate' | 'filter';
  actionData?: string;
};

export default function HelperAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I am your SERAS AI assistant. How can I help you today? I can find events, check registrations, or guide you through the platform.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { events, getRegistrationsByUser } = useEvents();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const processQuery = async (query: string) => {
    const q = query.toLowerCase();
    
    // Simulate thinking delay
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    setIsTyping(false);

    let response = '';
    let action: 'navigate' | 'filter' | undefined;
    let actionData: string | undefined;

    // Intents: Profile, Registration, Search Events, Help
    if (q.includes('my profile') || q.includes('my account') || q.includes('settings')) {
      if (profile) {
        response = 'Sure! I can take you to your student portfolio.';
        action = 'navigate';
        actionData = '/profile';
      } else {
        response = 'You need to sign in first to view your profile. Please click the Sign In button in the dock.';
      }
    } 
    else if (q.includes('my registration') || q.includes('my event') || q.includes('ticket')) {
      if (profile) {
        const regs = getRegistrationsByUser(profile.id);
        if (regs.length > 0) {
          response = `You have registered for ${regs.length} event(s). Let me take you to your portfolio so you can view your tickets.`;
          action = 'navigate';
          actionData = '/profile';
        } else {
          response = "You haven't registered for any events yet. Would you like to explore upcoming events?";
          action = 'navigate';
          actionData = '/';
        }
      } else {
        response = 'Please sign in to view your registrations.';
      }
    }
    else if (q.includes('find event') || q.includes('search') || q.includes('upcoming') || q.includes('show me events')) {
      const pubEvents = events.filter(e => e.status === 'published');
      if (pubEvents.length > 0) {
        const next = pubEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        response = `We have ${pubEvents.length} active events. The next one is "${next.title}" on ${next.date}. Let me show you the full list.`;
      } else {
        response = 'There are no active events at the moment. Please check back later.';
      }
      action = 'navigate';
      actionData = '/';
    }
    else if (q.includes('create event') || q.includes('admin') || q.includes('dashboard')) {
      if (profile?.role === 'admin') {
        response = 'Opening the Admin Dashboard for you.';
        action = 'navigate';
        actionData = '/admin';
      } else {
        response = 'Only administrators can create events or access the dashboard. If you are an organizer, please contact the system admin.';
      }
    }
    else if (q.includes('hi') || q.includes('hello')) {
      response = `Hello ${profile ? profile.full_name.split(' ')[0] : 'there'}! I can help you find events, check your tickets, or navigate the platform. What do you need?`;
    }
    else {
      // General fallback
      response = "I'm still learning! I can currently help you find events, check your registrations, and navigate to different pages like your Profile or the Admin Dashboard. Try asking 'Show my tickets' or 'Find events'.";
    }

    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), role: 'assistant', content: response, action, actionData }
    ]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    
    await processQuery(userMessage);
  };

  const handleAction = (action: 'navigate' | 'filter', data: string) => {
    if (action === 'navigate') {
      navigate(data);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 animate-bounce-slow"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative">
            {/* Tooltip */}
            <div className={`absolute right-16 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-4 py-2 rounded-xl shadow-lg border text-sm font-medium whitespace-nowrap transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}>
              Ask SERAS AI
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-popover rotate-45 border-r border-t"></div>
            </div>

            <Button 
              size="icon" 
              className="w-14 h-14 rounded-full shadow-2xl bg-gradient-to-tr from-primary to-secondary hover:scale-110 transition-transform duration-300"
              onClick={() => setIsOpen(true)}
            >
              <Bot className="w-7 h-7 text-white" />
              <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col z-50 shadow-2xl border-primary/20 animate-slide-up bg-background/95 backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center bg-primary/5 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-inner">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">SERAS AI</h3>
                <p className="text-xs text-primary font-medium">Platform Assistant</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-destructive/10 hover:text-destructive">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <Avatar className="w-8 h-8 mr-2 border">
                      <AvatarFallback className="bg-primary/10 text-primary"><Bot className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-sm' 
                      : 'bg-muted rounded-bl-sm border border-border/50'
                  }`}>
                    <p>{msg.content}</p>
                    
                    {msg.action && (
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="mt-3 w-full bg-background text-foreground hover:bg-background/80 text-xs shadow-sm"
                        onClick={() => handleAction(msg.action!, msg.actionData!)}
                      >
                        {msg.action === 'navigate' ? 'Take me there' : 'Apply Filter'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <Avatar className="w-8 h-8 mr-2 border">
                    <AvatarFallback className="bg-primary/10 text-primary"><Bot className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-bl-sm p-4 border border-border/50 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t bg-background rounded-b-xl">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input 
                placeholder="Ask me anything..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                className="rounded-full bg-muted/50 focus-visible:ring-primary/50 border-transparent focus:border-primary/50"
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!input.trim() || isTyping}>
                <Send className="w-4 h-4 ml-0.5" />
              </Button>
            </form>
          </div>
        </Card>
      )}
    </>
  );
}
