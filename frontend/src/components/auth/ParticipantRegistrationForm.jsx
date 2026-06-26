import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ParticipantRegistrationForm({ onComplete }) {
  const { profile, completeRegistration } = useAuth();
  const [form, setForm] = useState({
    fullName: profile?.full_name || '',
    studentId: '',
    department: '',
    year: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.studentId.trim()) errs.studentId = 'Student ID is required';
    if (!form.department) errs.department = 'Department is required';
    if (!form.year) errs.year = 'Year of study is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await completeRegistration(form);
      onComplete?.();
    } catch (err) {
      setErrors({ submit: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-md">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.2)] border border-outline-variant overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="gradient-primary p-xl text-center relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-sm">
            <span className="material-symbols-outlined text-white text-[32px]">how_to_reg</span>
          </div>
          <h2 className="text-xl font-bold text-white">Complete Your Registration</h2>
          <p className="text-sm text-white/70 mt-1">
            Welcome, {profile?.email}! Please fill in your details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-xl space-y-md">
          {/* Google account info */}
          <div className="flex items-center gap-md p-md bg-surface-container-low rounded-xl border border-outline-variant/50">
            {profile?.photo_url ? (
              <img
                src={profile.photo_url}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-fixed/20 flex items-center justify-center text-primary font-bold">
                {profile?.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-body-sm text-on-surface font-semibold truncate">{profile?.full_name || 'New User'}</p>
              <p className="text-body-sm text-on-surface-variant truncate">{profile?.email}</p>
            </div>
            <span className="material-symbols-outlined fill text-secondary text-[18px]">verified</span>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-xs">
              Full Name<span className="text-error ml-xs">*</span>
            </label>
            <input
              className={`w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border ${errors.fullName ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange('fullName')}
            />
            {errors.fullName && <p className="text-[11px] text-error mt-xs">{errors.fullName}</p>}
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-xs">
              Student ID<span className="text-error ml-xs">*</span>
            </label>
            <input
              className={`w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border ${errors.studentId ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
              placeholder="e.g. S-123456"
              value={form.studentId}
              onChange={handleChange('studentId')}
            />
            {errors.studentId && <p className="text-[11px] text-error mt-xs">{errors.studentId}</p>}
          </div>

          {/* Department + Year */}
          <div className="grid grid-cols-2 gap-sm">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-xs">
                Department<span className="text-error ml-xs">*</span>
              </label>
              <select
                className={`w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border ${errors.department ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                value={form.department}
                onChange={handleChange('department')}
              >
                <option disabled value="">Select Dept</option>
                <option value="cs">Computer Science</option>
                <option value="eng">Engineering</option>
                <option value="bus">Business</option>
                <option value="arts">Liberal Arts</option>
                <option value="sci">Natural Sciences</option>
              </select>
              {errors.department && <p className="text-[11px] text-error mt-xs">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-xs">
                Year of Study<span className="text-error ml-xs">*</span>
              </label>
              <select
                className={`w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border ${errors.year ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                value={form.year}
                onChange={handleChange('year')}
              >
                <option disabled value="">Select Year</option>
                <option value="freshman">Freshman</option>
                <option value="sophomore">Sophomore</option>
                <option value="junior">Junior</option>
                <option value="senior">Senior</option>
                <option value="graduate">Graduate</option>
              </select>
              {errors.year && <p className="text-[11px] text-error mt-xs">{errors.year}</p>}
            </div>
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-xs">
              Phone Number <span className="text-on-surface-variant text-[11px]">(Optional)</span>
            </label>
            <input
              className="w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange('phone')}
            />
          </div>

          {errors.submit && (
            <div className="bg-error-container/30 border border-error/20 rounded-xl p-sm text-body-sm text-error text-center">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white py-[12px] px-lg rounded-xl text-label-md font-label-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-sm">
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Submitting...
              </span>
            ) : (
              'Submit Registration'
            )}
          </button>

          <p className="text-body-sm text-on-surface-variant text-center">
            Your registration will be reviewed by an admin before you can access events.
          </p>
        </form>
      </div>
    </div>
  );
}
