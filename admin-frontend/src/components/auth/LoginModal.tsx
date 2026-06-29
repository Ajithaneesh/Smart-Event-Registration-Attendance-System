import { useAuth } from '../../context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { signInWithGoogle, authError } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // onClose not strictly needed here as the page will redirect, but good practice
      onClose();
    } catch (error: any) {
      toast.error('Failed to sign in', { description: error.message });
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none bg-background/80 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="text-center sm:text-center pt-8 pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-3xl font-bold tracking-tight text-foreground">Welcome to SERAS</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Sign in to register for events, download certificates, and manage your portfolio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 p-6 pt-0">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full h-12 text-base font-semibold shadow-md bg-white text-black hover:bg-gray-100 border border-gray-200"
          >
            {loading ? (
              <span className="animate-spin mr-2">⟳</span>
            ) : (
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </Button>

          {authError && (
            <p className="text-sm text-destructive text-center mt-2">{authError}</p>
          )}

          <div className="text-center text-xs text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
