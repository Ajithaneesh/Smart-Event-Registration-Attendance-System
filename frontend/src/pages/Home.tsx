import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Search, ArrowRight, UserPlus, Users, MonitorPlay, Code2, Heart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Home() {
  const { events, loading, favorites, toggleFavorite } = useEvents();
  const { profile, setShowLogin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Workshop', 'Seminar'];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (event.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory && event.status === 'published';
  });

  const featuredEvents = events.filter(e => e.featured && e.status === 'published');

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex flex-col items-center gap-8">
        <div className="w-full max-w-4xl h-64 rounded-xl bg-muted animate-pulse"></div>
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 rounded-xl bg-muted animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const isFavorite = (eventId: string) => favorites.some(f => f.event_id === eventId);

  return (
    <div className="min-h-screen w-full">
      {/* Premium Hero Section */}
      <section className="relative w-full min-h-[450px] flex items-center justify-center overflow-hidden py-20 px-4">
        {/* Background is handled by index.css, we just need a dark overlay if needed */}
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-0"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Platform Upgrade 2026
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Discover & Join <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Events</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            The smartest way to manage, discover, and experience campus events. Register now and build your portfolio.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 group" onClick={() => {
              document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Events
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            {!profile && (
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-md" onClick={() => setShowLogin(true)}>
                Create Account
              </Button>
            )}
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 md:left-20 animate-float-1 hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
          <MonitorPlay className="w-8 h-8 text-primary" />
        </div>
        <div className="absolute bottom-1/4 right-10 md:right-20 animate-float-2 hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
          <Code2 className="w-8 h-8 text-secondary" />
        </div>
      </section>

      {/* Featured Events Carousel (simplified for now) */}
      {featuredEvents.length > 0 && (
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary fill">star</span>
            Featured Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.slice(0, 3).map(event => (
              <EventCard key={event.id} event={event} navigate={navigate} isFav={isFavorite(event.id)} toggleFav={() => profile && toggleFavorite(profile.id, event.id)} profile={profile} />
            ))}
          </div>
        </section>
      )}

      {/* Main Events Section */}
      <section id="events-section" className="py-12 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 sticky top-0 z-20 bg-background/80 backdrop-blur-xl p-4 -mx-4 md:mx-0 rounded-b-2xl border-b md:border md:rounded-2xl shadow-sm">
          <h2 className="text-3xl font-bold">Upcoming Events</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8 w-full">
          <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b rounded-none h-auto pb-px">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-border bg-muted/30">
            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            <Button variant="link" onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}>
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <EventCard 
                  event={event} 
                  navigate={navigate} 
                  isFav={isFavorite(event.id)} 
                  toggleFav={() => profile && toggleFavorite(profile.id, event.id)}
                  profile={profile}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event, navigate, isFav, toggleFav, profile }: any) {
  return (
    <Card className="group overflow-hidden border border-border/50 bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-muted">
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/10">
            <Calendar className="w-16 h-16 text-secondary/40" />
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-md hover:bg-background">
            {event.category}
          </Badge>
          {event.is_paid && (
            <Badge variant="destructive" className="bg-destructive/90 backdrop-blur-md">
              ₹{event.price}
            </Badge>
          )}
        </div>
        
        {profile && (
          <button 
            onClick={(e) => { e.stopPropagation(); toggleFav(); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}
      </div>

      <CardHeader className="p-4 pb-2">
        <CardTitle className="line-clamp-2 text-lg font-bold group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 mt-2">
          <Calendar className="w-4 h-4 text-primary" />
          {format(new Date(event.date), 'MMM dd, yyyy')} • {event.time}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-1">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.participation_type === 'Team' ? <Users className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{event.participation_type} {event.participation_type === 'Team' ? `(Max ${event.max_team_size})` : ''}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={() => navigate(`/event/${event.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
