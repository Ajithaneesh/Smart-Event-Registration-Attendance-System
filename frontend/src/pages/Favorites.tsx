import { useEvents } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Heart, Calendar, MapPin, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Favorites() {
  const { favorites, events, toggleFavorite } = useEvents();
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const favoriteEvents = favorites
    .map(fav => events.find(e => e.id === fav.event_id))
    .filter(Boolean) as any[];

  return (
    <div className="min-h-screen pt-24 px-4 pb-24 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 fill-red-500 text-red-500" /> My Favorites
          </h1>
          <p className="text-muted-foreground mt-2">Events you've saved for later.</p>
        </div>

        {favoriteEvents.length === 0 ? (
          <div className="text-center py-20 px-4 rounded-xl border border-dashed border-border bg-muted/10">
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">Start exploring events and save the ones you like.</p>
            <Button onClick={() => navigate('/')}>Explore Events</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteEvents.map((event) => (
              <Card key={event.id} className="group overflow-hidden border border-border bg-card flex flex-col h-full">
                <div className="relative h-40 overflow-hidden bg-muted">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                      <Calendar className="w-12 h-12 text-secondary/40" />
                    </div>
                  )}
                  
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-md">
                      {event.category}
                    </Badge>
                  </div>
                  
                  <button 
                    onClick={() => toggleFavorite(profile.id, event.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center text-red-500 hover:bg-background transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <CardHeader className="p-4 pb-2">
                  <CardTitle className="line-clamp-1 text-lg">{event.title}</CardTitle>
                </CardHeader>

                <CardContent className="p-4 pt-0 flex-1">
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" onClick={() => navigate(`/event/${event.id}`)}>
                    View Event
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
