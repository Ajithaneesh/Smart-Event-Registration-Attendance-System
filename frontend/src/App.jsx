import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/sonner';

import Dock from './components/layout/Dock';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import HelperAI from './components/ai/HelperAI';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginModal from './components/auth/LoginModal';

// Pages
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Register from './pages/Register';
import TicketPage from './pages/TicketPage';
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './pages/Scanner';
import CreateEvent from './pages/CreateEvent';
import AdminAnalytics from './pages/AdminAnalytics';
import Favorites from './pages/Favorites';
import StudentPortfolio from './pages/StudentPortfolio';
import FeedbackCertificate from './pages/FeedbackCertificate';
import FacultyDirectory from './pages/FacultyDirectory';
import MessagesPage from './pages/MessagesPage';

const queryClient = new QueryClient();

function AppLayout() {
  const { showLogin, setShowLogin } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background pb-28 text-foreground transition-colors duration-300">
      <Dock />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Bar (mobile) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30">
          <Sidebar />
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-primary">SERAS</span>
          </div>

          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/register/:eventId" element={<ProtectedRoute><Register /></ProtectedRoute>} />
            <Route path="/ticket/:regId" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/scanner" element={<ProtectedRoute adminOnly><Scanner /></ProtectedRoute>} />
            <Route path="/admin/create-event" element={<ProtectedRoute adminOnly><CreateEvent /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
            
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><StudentPortfolio /></ProtectedRoute>} />
            <Route path="/feedback/:eventId" element={<ProtectedRoute><FeedbackCertificate /></ProtectedRoute>} />
            <Route path="/faculty" element={<FacultyDirectory />} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          </Routes>
        </main>

        <Footer />
      </div>

      <HelperAI />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="seras-theme">
        <Router>
          <AuthProvider>
            <EventProvider>
              <AppLayout />
            </EventProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}