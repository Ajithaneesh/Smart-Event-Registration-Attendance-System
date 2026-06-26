import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, User, School, MessageSquare, Settings, LogIn, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

function DockIcon({ 
  item, 
  mouseX, 
  isActive, 
  onClick 
}: { 
  item: any; 
  mouseX: any; 
  isActive: boolean; 
  onClick: () => void; 
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Scale based on distance from mouse (macOS dock effect)
  const widthSync = useTransform(distance, [-150, 0, 150], [48, 80, 48]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width, height: width }}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-colors duration-200 border-2",
          isActive 
            ? "bg-primary text-primary-foreground border-primary/20 shadow-lg" 
            : "bg-background/80 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-primary backdrop-blur-sm"
        )}
      >
        <item.icon className="w-1/2 h-1/2" />
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-12 px-3 py-1.5 bg-popover text-popover-foreground text-xs font-semibold rounded-lg shadow-xl border border-border whitespace-nowrap pointer-events-none z-50"
          >
            {item.label}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover rotate-45 border-r border-b border-border"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Dock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isAdmin, isParticipant, showLogin, setShowLogin } = useAuth();
  const { theme, setTheme } = useTheme();
  const mouseX = useMotionValue(Infinity);

  const getNavItems = () => {
    const baseItems = [
      { id: 'home', label: 'Home', icon: Home, path: '/' },
      { id: 'faculty', label: 'Faculty', icon: School, path: '/faculty' },
    ];

    if (profile) {
      if (isParticipant) {
        baseItems.push(
          { id: 'favorites', label: 'Favorites', icon: Heart, path: '/favorites' },
          { id: 'profile', label: 'Portfolio', icon: User, path: '/profile' },
          { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' }
        );
      } else if (isAdmin) {
        baseItems.push(
          { id: 'admin', label: 'Admin', icon: Settings, path: '/admin' }
        );
      }
    }
    
    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:block" // Hidden on small screens, can implement a mobile bar later if needed
    >
      <div 
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-4 py-3 bg-background/60 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
            
          return (
            <DockIcon 
              key={item.id} 
              item={item} 
              mouseX={mouseX} 
              isActive={isActive} 
              onClick={() => navigate(item.path)} 
            />
          );
        })}

        <div className="w-[1px] h-10 bg-border/80 mx-1 self-center" />

        <DockIcon 
          item={{ id: 'theme', label: theme === 'dark' ? 'Light Mode' : 'Dark Mode', icon: theme === 'dark' ? Sun : Moon }} 
          mouseX={mouseX} 
          isActive={false} 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
        />

        {!profile && (
          <>
            <div className="w-[1px] h-10 bg-border/80 mx-1 self-center" />
            <DockIcon 
              item={{ id: 'login', label: 'Sign In', icon: LogIn }} 
              mouseX={mouseX} 
              isActive={false} 
              onClick={() => setShowLogin(true)} 
            />
          </>
        )}
      </div>
    </motion.div>
  );
}
