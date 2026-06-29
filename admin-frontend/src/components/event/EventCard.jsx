import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../context/EventContext';
import { isFavorite } from '../../utils/localStorage';
import { useState } from 'react';
import { motion } from 'framer-motion';

const categoryColors = {
  Tech: 'bg-primary/10 text-primary',
  Cultural: 'bg-tertiary-fixed text-tertiary',
  Sports: 'bg-secondary-container/30 text-secondary',
  Workshop: 'bg-primary-fixed text-on-primary-fixed-variant',
  Seminar: 'bg-secondary-fixed/30 text-on-secondary-fixed-variant',
};

const categoryIcons = {
  Tech: 'memory',
  Cultural: 'palette',
  Sports: 'sports_basketball',
  Workshop: 'build',
  Seminar: 'school',
};

export default function EventCard({ event, compact = false, index = 0 }) {
  const { profile } = useAuth();
  const { toggleFavorite } = useEvents();
  const [heartAnim, setHeartAnim] = useState(false);

  const fav = profile && isFavorite(profile.id, event.id);

  const handleFavToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile) return;
    toggleFavorite(profile.id, event.id);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 600);
  };

  const regCount = event._registrationCount || 0;
  const capacityPercent = event.capacity ? Math.min((regCount / event.capacity) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.4, delay: (index % 10) * 0.1, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="h-full"
    >
      <Link
        to={`/event/${event.id}`}
        className="group h-full flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
      >
        {/* Image or Icon Header */}
      <div className="relative h-44 overflow-hidden bg-surface-container-high">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center gradient-primary">
            <span className="material-symbols-outlined text-[56px] text-white/60">
              {event.icon || categoryIcons[event.category] || 'event'}
            </span>
          </div>
        )}

        {/* Category Badge */}
        <div className={`absolute top-sm left-sm px-sm py-xs rounded-lg text-label-caps font-label-caps font-semibold backdrop-blur-sm ${categoryColors[event.category] || 'bg-surface/80 text-on-surface'}`}>
          {event.category}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavToggle}
          className="absolute top-sm right-sm w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center hover:bg-surface-container-lowest transition-all shadow-sm"
        >
          <span
            className={`material-symbols-outlined text-[20px] transition-all ${
              fav ? 'fill text-error' : 'text-on-surface-variant'
            } ${heartAnim ? 'animate-heart-beat' : ''}`}
          >
            favorite
          </span>
        </button>

        {event.featured && (
          <div className="absolute bottom-sm left-sm bg-secondary text-on-secondary px-sm py-xs rounded-lg text-label-caps font-label-caps flex items-center gap-1 shadow-md">
            <span className="material-symbols-outlined text-[12px] fill">star</span>
            FEATURED
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-md space-y-sm">
        <h3 className="text-title-md font-title-md text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {!compact && (
          <p className="text-body-sm font-body-sm text-on-surface-variant line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-sm text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            <span className="truncate max-w-[120px]">{event.venue}</span>
          </span>
        </div>

        {/* Capacity Bar */}
        {event.capacity && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-on-surface-variant">
              <span>{regCount} registered</span>
              <span>{event.capacity} spots</span>
            </div>
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${capacityPercent}%`,
                  background: capacityPercent > 80
                    ? 'linear-gradient(90deg, #ba1a1a, #ff5252)'
                    : 'linear-gradient(90deg, #24389c, #4355b9)',
                }}
              />
            </div>
          </div>
        )}
      </div>
      </Link>
    </motion.div>
  );
}
