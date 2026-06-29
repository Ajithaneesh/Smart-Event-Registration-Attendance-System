import { useAuth } from '../context/AuthContext';

export default function PendingApproval() {
  const { profile, signOut } = useAuth();

  return (
    <div className="flex-1 flex items-center justify-center p-xl animate-fade-in">
      <div className="text-center max-w-md mx-auto space-y-lg">
        {/* Animated waiting indicator */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[40px]">hourglass_top</span>
          </div>
        </div>

        {/* Status message */}
        <div className="space-y-sm">
          <h2 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface font-bold">
            Registration Pending
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
            Thank you for registering, <strong className="text-on-surface">{profile?.full_name || 'User'}</strong>! 
            Your account is currently being reviewed by an administrator.
          </p>
        </div>

        {/* Info card */}
        <div className="bg-surface-container-low border border-outline-variant/50 rounded-2xl p-lg text-left space-y-md">
          <div className="flex items-start gap-md">
            <span className="material-symbols-outlined text-primary mt-[2px]">info</span>
            <div>
              <p className="text-label-md font-label-md text-on-surface font-semibold">What happens next?</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-xs">
                An admin will review your registration and approve your account. 
                Once approved, you'll have full access to browse and register for events.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-md">
            <span className="material-symbols-outlined text-secondary mt-[2px]">schedule</span>
            <div>
              <p className="text-label-md font-label-md text-on-surface font-semibold">Estimated wait time</p>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-xs">
                Most registrations are reviewed within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Profile summary */}
        {profile && (
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-md">
            <div className="flex items-center gap-md">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt="Profile" className="w-12 h-12 rounded-full border-2 border-primary/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-fixed/20 flex items-center justify-center text-primary font-bold text-lg">
                  {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1 text-left">
                <p className="text-title-sm font-semibold text-on-surface truncate">{profile.full_name}</p>
                <p className="text-body-sm text-on-surface-variant truncate">{profile.email}</p>
              </div>
              <div className="flex items-center gap-1 px-sm py-xs bg-tertiary-container/40 rounded-full">
                <span className="material-symbols-outlined text-tertiary text-[14px]">pending</span>
                <span className="text-[11px] text-tertiary font-semibold uppercase tracking-wide">Pending</span>
              </div>
            </div>
          </div>
        )}

        {/* Sign out button */}
        <button
          onClick={signOut}
          className="inline-flex items-center gap-sm px-lg py-[10px] bg-error-container/30 text-error rounded-xl text-label-md font-label-md font-semibold hover:bg-error-container/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out & Switch Account
        </button>
      </div>
    </div>
  );
}
