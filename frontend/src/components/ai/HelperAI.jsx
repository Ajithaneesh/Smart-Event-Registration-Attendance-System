import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FAQ_RESPONSES = {
  register: {
    keywords: ['register', 'sign up', 'signup', 'how to join', 'enroll', 'registration'],
    answer: '📝 **How to Register for an Event:**\n\n1. Browse events on the Home page\n2. Click on an event card to view details\n3. Click "Register Now"\n4. Fill in your details (name, email, student ID)\n5. Verify your email with the OTP code\n6. Submit — you\'ll get your QR ticket instantly!',
    action: { label: 'Explore Events Now', path: '/' }
  },
  ticket: {
    keywords: ['ticket', 'qr code', 'qr', 'pass', 'where is my ticket', 'find ticket', 'download ticket'],
    answer: '🎫 **Finding Your Ticket:**\n\nAfter registration, your ticket with QR code is shown immediately. You can also:\n\n• Go to **Profile** → View your registered events\n• Click on any event → View your ticket\n• Download the QR code for offline use\n\nYour ticket ID is your unique check-in pass!',
    action: { label: 'Go to Profile', path: '/profile' }
  },
  checkin: {
    keywords: ['check in', 'checkin', 'check-in', 'attendance', 'scan', 'mark attendance'],
    answer: '✅ **Check-in Process:**\n\n1. At the event venue, find the registration desk\n2. Show your QR code (from your ticket page)\n3. The admin will scan it using the QR Scanner\n4. You\'ll be marked as "Attended"\n5. After the event, you can access feedback & certificates!',
    action: { label: 'Go to Scanner (Admin)', path: '/admin' }
  },
  certificate: {
    keywords: ['certificate', 'cert', 'participation', 'download certificate'],
    answer: '🏆 **Getting Your Certificate:**\n\nCertificates are available after:\n1. You attended the event (checked in via QR)\n2. The event has ended\n\nGo to the event page → "Feedback & Certificate" → Download your participation certificate with your name and event details!',
    action: { label: 'Go to Profile', path: '/profile' }
  },
  feedback: {
    keywords: ['feedback', 'rating', 'review', 'rate', 'suggestion'],
    answer: '⭐ **Submitting Feedback:**\n\nAfter attending an event:\n1. Go to the event page\n2. Click "Feedback & Certificate"\n3. Rate the event (1-5 stars)\n4. Add comments or suggestions\n5. Submit!\n\nYour feedback helps improve future events.',
    action: { label: 'Go to Home', path: '/' }
  },
  faculty: {
    keywords: ['faculty', 'teacher', 'professor', 'contact', 'call faculty', 'message faculty'],
    answer: '👩‍🏫 **Contacting Faculty:**\n\n1. Go to **Faculty** page in the sidebar\n2. Browse all faculty members\n3. Click **Call** to open phone dialer\n4. Click **Message** to send an in-app message\n5. Click the email icon to send an email\n\nYou can also find faculty on each event\'s detail page.',
    action: { label: 'View Faculty Directory', path: '/faculty' }
  },
  favorite: {
    keywords: ['favorite', 'bookmark', 'save event', 'saved', 'favorites'],
    answer: '❤️ **Saving Favorites:**\n\nClick the heart icon ❤️ on any event card to save it to your favorites. View all saved events in the **Favorites** page. Favorites are saved locally for instant access!',
    action: { label: 'View My Favorites', path: '/favorites' }
  },
  reminder: {
    keywords: ['reminder', 'notify', 'notification', 'remind me', 'alert'],
    answer: '🔔 **Setting Reminders:**\n\nOn any event detail page, click "Set Reminder" to get notified before the event starts. You can choose:\n• 1 day before\n• 1 hour before\n• Custom time\n\nReminders show as browser notifications and in your notification bell.',
    action: { label: 'Go to Events', path: '/' }
  },
  admin: {
    keywords: ['admin', 'dashboard', 'manage', 'create event', 'admin access'],
    answer: '🔑 **Admin Access:**\n\n1. Click **Dashboard** in the sidebar\n2. Enter the admin PIN: **1234**\n3. You\'ll have access to:\n   • Event management & creation\n   • Registration table with CSV export\n   • QR Scanner for check-ins\n   • Analytics dashboard',
    action: { label: 'Open Admin Portal', path: '/admin' }
  },
  idcard: {
    keywords: ['id card', 'identity', 'event id', 'badge', 'id'],
    answer: '🪪 **ID Card Generation:**\n\nAfter registering for an event:\n1. Go to your ticket page\n2. Click "Generate ID Card"\n3. Your photo (from profile) + name + event info will be on the card\n4. Download it as a PNG image!\n\nMake sure to upload a profile photo first in My Profile.',
    action: { label: 'Go to Profile', path: '/profile' }
  },
};

const GREETINGS = [
  "Hi! I'm your SERAS Helper AI 🤖. How can I help you today?",
  "Welcome! Ask me anything about events, registration, or the platform.",
];

function findResponse(input) {
  const lower = input.toLowerCase();
  for (const [, faq] of Object.entries(FAQ_RESPONSES)) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return { answer: faq.answer, action: faq.action };
    }
  }
  return null;
}

function getContextualSuggestions(pathname) {
  if (pathname === '/') return ['How do I register?', 'Show me my favorites', 'What events are available?'];
  if (pathname.includes('/event/')) return ['How to register?', 'Who are the faculty?', 'Set a reminder'];
  if (pathname.includes('/register')) return ['What info do I need?', 'How does email verification work?'];
  if (pathname.includes('/ticket')) return ['How to check in?', 'Download my ticket', 'Get my ID card'];
  if (pathname.includes('/admin')) return ['How to scan QR?', 'Export CSV', 'Create an event'];
  if (pathname.includes('/feedback')) return ['How to get certificate?', 'Submit feedback'];
  return ['How do I register?', 'Where is my ticket?', 'Contact faculty'];
}

export default function HelperAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: GREETINGS[0] },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeakingId, setIsSpeakingId] = useState(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const suggestions = getContextualSuggestions(location.pathname);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function speakText(text, index) {
    if (isSpeakingId === index) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    // Remove markdown formatting characters for clean speech
    const cleanText = text.replace(/[*#_•🎫📝✅🏆⭐🔑🪪👩‍🏫❤️🔔]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);
    setIsSpeakingId(index);
    window.speechSynthesis.speak(utterance);
  }

  // Cancel speech synthesis if chat window closes
  useEffect(() => {
    if (!isOpen) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
    }
  }, [isOpen]);

  function handleSend(text) {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      const result = findResponse(msg);
      if (result) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: result.answer,
            action: result.action
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'ai',
            text: "I'm not sure about that. Try asking about: registration, tickets, check-in, certificates, faculty, favorites, or reminders! 😊",
          },
        ]);
      }
    }, 800);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-error text-on-error rotate-0'
            : 'gradient-primary text-white animate-pulse-glow hover:scale-110'
        }`}
      >
        <span className="material-symbols-outlined text-[24px]">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[520px] bg-surface-container-lowest rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] border border-outline-variant flex flex-col animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="gradient-primary p-md flex items-center gap-sm">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">smart_toy</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">SERAS Helper AI</h3>
              <p className="text-[11px] text-white/70">Always here to help</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[11px] text-white/70">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-md space-y-md">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-xs max-w-[85%] group">
                  <div
                    className={`px-md py-sm rounded-2xl text-body-sm font-body-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-primary text-on-primary rounded-br-sm'
                        : 'bg-surface-container-high text-on-surface rounded-bl-sm'
                    }`}
                  >
                    {msg.text}

                    {/* Action Shortcut Button */}
                    {msg.action && (
                      <button
                        onClick={() => {
                          if (msg.action.path === '/') {
                            const discoverSection = document.getElementById('discover');
                            if (discoverSection) {
                              discoverSection.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              navigate('/');
                            }
                          } else {
                            navigate(msg.action.path);
                          }
                          setIsOpen(false);
                        }}
                        className="mt-md w-full bg-primary text-white py-xs px-sm rounded-lg text-[11px] font-semibold flex items-center justify-center gap-xs hover:bg-primary/90 transition-all shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        {msg.action.label}
                      </button>
                    )}
                  </div>

                  {/* TTS Speaker Icon on Hover for AI Messages */}
                  {msg.role === 'ai' && (
                    <button
                      onClick={() => speakText(msg.text, i)}
                      className={`text-on-surface-variant/60 hover:text-primary transition-all p-xs rounded-full ${
                        isSpeakingId === i ? 'text-primary scale-110' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title={isSpeakingId === i ? 'Stop speaking' : 'Read aloud'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isSpeakingId === i ? 'volume_off' : 'volume_up'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Bouncing Dots Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-surface-container-high text-on-surface px-md py-sm rounded-2xl rounded-bl-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-on-surface-variant/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-on-surface-variant/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-on-surface-variant/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="px-md pb-sm flex gap-1 overflow-x-auto">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="whitespace-nowrap bg-primary-fixed/50 text-on-primary-fixed-variant px-sm py-1 rounded-full text-[11px] font-medium hover:bg-primary-fixed transition-colors flex-shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-sm border-t border-outline-variant flex gap-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-surface-container-high rounded-full px-md py-[8px] text-body-sm font-body-sm text-on-surface placeholder:text-outline outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}