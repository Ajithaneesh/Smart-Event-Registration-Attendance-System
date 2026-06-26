export default function Footer() {
  return (
    <footer className="w-full py-6 mt-12 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-md">
            S
          </div>
          <span className="font-semibold text-lg text-foreground">SERAS</span>
        </div>
        
        <p className="text-sm text-muted-foreground text-center md:text-left">
          © {new Date().getFullYear()} Smart Event Registration & Attendance System. All rights reserved.
        </p>

        <div className="flex gap-4">
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a>
          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help</a>
        </div>
      </div>
    </footer>
  );
}
