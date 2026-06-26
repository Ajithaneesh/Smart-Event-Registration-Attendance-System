export default function FacultyCard({ faculty, onMessage, onCall }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md card-hover animate-fade-in">
      <div className="flex items-start gap-md">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
          {faculty.faculty_name?.[0]?.toUpperCase() || 'F'}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-body-sm font-body-sm font-semibold text-on-surface truncate">
            {faculty.faculty_name}
          </h4>
          <p className="text-[11px] text-primary font-medium">{faculty.faculty_role}</p>
          <p className="text-[11px] text-on-surface-variant">{faculty.department}</p>

          {/* Availability Badge */}
          <div className="mt-sm flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${faculty.is_available ? 'bg-green-500' : 'bg-outline'}`}
            />
            <span className="text-[11px] text-on-surface-variant">
              {faculty.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Actions */}
      <div className="flex gap-sm mt-md">
        <a
          href={`tel:${faculty.phone}`}
          onClick={(e) => {
            e.stopPropagation();
            onCall?.(faculty);
          }}
          className="flex-1 flex items-center justify-center gap-1 bg-secondary/10 text-secondary py-[6px] rounded-lg text-label-md font-label-md font-medium hover:bg-secondary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">call</span>
          Call
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMessage?.(faculty);
          }}
          className="flex-1 flex items-center justify-center gap-1 bg-primary/10 text-primary py-[6px] rounded-lg text-label-md font-label-md font-medium hover:bg-primary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">chat</span>
          Message
        </button>
        <a
          href={`mailto:${faculty.email}`}
          className="flex items-center justify-center w-9 bg-surface-container-high text-on-surface-variant rounded-lg hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">mail</span>
        </a>
      </div>
    </div>
  );
}
