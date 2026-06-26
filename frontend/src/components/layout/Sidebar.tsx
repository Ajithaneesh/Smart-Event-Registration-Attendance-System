import { useAuth } from '../../context/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Menu, LogOut, LogIn, Home, Heart, User, School, MessageSquare, Settings, QrCode, PlusCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Sidebar() {
  const { profile, isAdmin, signOut, setShowLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const NavItem = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => {
    const isActive = location.pathname === path;
    return (
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={`w-full justify-start gap-3 h-12 ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/20 font-semibold' : 'text-muted-foreground'}`}
        onClick={() => {
          navigate(path);
          setOpen(false);
        }}
      >
        <Icon className="w-5 h-5" />
        {label}
      </Button>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 flex flex-col bg-background/95 backdrop-blur-xl border-r">
        <SheetHeader className="p-6 border-b text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <SheetTitle className="text-2xl font-bold text-primary">SERAS</SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {profile ? (
            <div className="mb-6 p-4 rounded-xl bg-secondary/50 border border-border flex items-center gap-3 mx-1">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          ) : (
            <Button 
              className="w-full mb-6 gap-2" 
              onClick={() => {
                setOpen(false);
                setShowLogin(true);
              }}
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Button>
          )}

          <div className="space-y-1">
            <NavItem icon={Home} label="Home" path="/" />
            <NavItem icon={School} label="Faculty" path="/faculty" />
            
            {profile && (
              <>
                <NavItem icon={Heart} label="Favorites" path="/favorites" />
                <NavItem icon={User} label="Profile" path="/profile" />
                <NavItem icon={MessageSquare} label="Messages" path="/messages" />
              </>
            )}
          </div>

          {isAdmin && (
            <div className="mt-8">
              <div className="px-4 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Admin Panel
              </div>
              <div className="space-y-1">
                <NavItem icon={Settings} label="Dashboard" path="/admin" />
                <NavItem icon={QrCode} label="Scanner" path="/admin/scanner" />
                <NavItem icon={PlusCircle} label="Create Event" path="/admin/create-event" />
              </div>
            </div>
          )}
        </div>

        {profile && (
          <div className="p-4 border-t">
            <Button 
              variant="destructive" 
              className="w-full gap-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                signOut();
                setOpen(false);
              }}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
