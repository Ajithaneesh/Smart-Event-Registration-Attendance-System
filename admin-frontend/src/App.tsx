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
import { AnimatePresence, motion } from 'framer-motion';

// Pages
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './pages/Scanner';
import CreateEvent from './pages/CreateEvent';
import AdminAnalytics from './pages/AdminAnalytics';
import FacultyDirectory from './pages/FacultyDirectory';
import MessagesPage from './pages/MessagesPage';

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 }
};

function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

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
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold text-primary">SERAS Admin</span>
          </div>

          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<ProtectedRoute adminOnly><AnimatedRoute><AdminDashboard /></AnimatedRoute></ProtectedRoute>} />
              <Route path="/scanner" element={<ProtectedRoute adminOnly><AnimatedRoute><Scanner /></AnimatedRoute></ProtectedRoute>} />
              <Route path="/create-event" element={<ProtectedRoute adminOnly><AnimatedRoute><CreateEvent /></AnimatedRoute></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute adminOnly><AnimatedRoute><AdminAnalytics /></AnimatedRoute></ProtectedRoute>} />
              <Route path="/faculty" element={<AnimatedRoute><FacultyDirectory /></AnimatedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><AnimatedRoute><MessagesPage /></AnimatedRoute></ProtectedRoute>} />
            </Routes>
          </AnimatePresence>
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
