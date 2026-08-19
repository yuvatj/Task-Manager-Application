import React, { useState, useEffect } from 'react';
import { useAppContext } from '../store';
import { KeyRound, User, Palette, Bell, ShieldAlert, Check, Sun, Moon, X } from 'lucide-react';

type SectionId = 'profile' | 'security' | 'appearance' | 'notifications' | 'danger';

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'security', label: 'Security', icon: <KeyRound size={16} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'danger', label: 'Danger Zone', icon: <ShieldAlert size={16} /> },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-color-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const sectionCardStyle: React.CSSProperties = {
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  margin: 0,
  color: 'var(--text-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const sectionSubtextStyle: React.CSSProperties = {
  margin: '4px 0 0 0',
  color: 'var(--text-secondary)',
  fontSize: '0.9rem'
};

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="switch-track" />
  </label>
);

const ProfileSection: React.FC = () => {
  const { currentAdmin, updateProfileName } = useAppContext();
  const [name, setName] = useState(currentAdmin?.name || '');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    const result = await updateProfileName(name);
    setSubmitting(false);
    setStatus(result.ok ? { type: 'success', message: 'Profile updated.' } : { type: 'error', message: result.error });
  };

  return (
    <div className="glass-panel animate-fade-in" style={sectionCardStyle}>
      <div>
        <h2 style={sectionHeadingStyle}><User size={20} /> Profile</h2>
        <p style={sectionSubtextStyle}>Update how your name appears across the app.</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Full name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
          <input type="email" value={currentAdmin?.email || ''} disabled style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />
        </div>

        {status && (
          <p style={{ color: status.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)', margin: 0, fontSize: '0.9rem' }}>
            {status.message}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '12px 24px', fontSize: '1rem', alignSelf: 'flex-start' }}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

const SecuritySection: React.FC = () => {
  const { changePassword } = useAppContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    setSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setSubmitting(false);

    if (!result.ok) {
      setStatus({ type: 'error', message: result.error });
      return;
    }
    setStatus({ type: 'success', message: 'Password updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="glass-panel animate-fade-in" style={sectionCardStyle}>
      <div>
        <h2 style={sectionHeadingStyle}><KeyRound size={20} /> Change Password</h2>
        <p style={sectionSubtextStyle}>Use a strong password you don't use elsewhere.</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
        <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} style={inputStyle} />
        <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} style={inputStyle} />

        {status && (
          <p style={{ color: status.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)', margin: 0, fontSize: '0.9rem' }}>
            {status.message}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '12px 24px', fontSize: '1rem', alignSelf: 'flex-start' }}>
          {submitting ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

const AppearanceSection: React.FC = () => {
  const { theme, setTheme } = useAppContext();

  const OptionCard: React.FC<{ id: 'light' | 'dark'; label: string; icon: React.ReactNode }> = ({ id, label, icon }) => (
    <button
      type="button"
      onClick={() => setTheme(id)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        padding: '20px', borderRadius: '12px', width: '140px',
        border: theme === id ? '2px solid var(--brand-color)' : '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-color-secondary)', color: 'var(--text-primary)', position: 'relative'
      }}
    >
      {theme === id && (
        <div style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--brand-color)' }}>
          <Check size={16} />
        </div>
      )}
      {icon}
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
    </button>
  );

  return (
    <div className="glass-panel animate-fade-in" style={sectionCardStyle}>
      <div>
        <h2 style={sectionHeadingStyle}><Palette size={20} /> Appearance</h2>
        <p style={sectionSubtextStyle}>Choose how the app looks on this device.</p>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <OptionCard id="light" label="Light" icon={<Sun size={22} />} />
        <OptionCard id="dark" label="Dark" icon={<Moon size={22} />} />
      </div>
    </div>
  );
};

const NotificationsSection: React.FC = () => {
  const [emailUpdates, setEmailUpdates] = useState(() => localStorage.getItem('taskmgr_notif_email') !== 'false');
  const [dueReminders, setDueReminders] = useState(() => localStorage.getItem('taskmgr_notif_due') !== 'false');
  const [weeklyDigest, setWeeklyDigest] = useState(() => localStorage.getItem('taskmgr_notif_digest') === 'true');

  const rows: { key: string; label: string; description: string; value: boolean; onChange: (v: boolean) => void }[] = [
    {
      key: 'email', label: 'Email updates', description: 'Get notified when a task is assigned to you.',
      value: emailUpdates, onChange: (v) => { setEmailUpdates(v); localStorage.setItem('taskmgr_notif_email', String(v)); }
    },
    {
      key: 'due', label: 'Due date reminders', description: 'Reminders before a task delivery date arrives.',
      value: dueReminders, onChange: (v) => { setDueReminders(v); localStorage.setItem('taskmgr_notif_due', String(v)); }
    },
    {
      key: 'digest', label: 'Weekly digest', description: 'A weekly summary of project activity.',
      value: weeklyDigest, onChange: (v) => { setWeeklyDigest(v); localStorage.setItem('taskmgr_notif_digest', String(v)); }
    },
  ];

  return (
    <div className="glass-panel animate-fade-in" style={sectionCardStyle}>
      <div>
        <h2 style={sectionHeadingStyle}><Bell size={20} /> Notifications</h2>
        <p style={sectionSubtextStyle}>Control what you get notified about. Preferences are saved on this device.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((row, i) => (
          <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-color)' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{row.label}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{row.description}</p>
            </div>
            <Toggle checked={row.value} onChange={row.onChange} />
          </div>
        ))}
      </div>
    </div>
  );
};

const DangerZoneSection: React.FC = () => {
  const { deleteAccount } = useAppContext();
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await deleteAccount(password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ ...sectionCardStyle, border: '1px solid var(--danger-color)' }}>
      <div>
        <h2 style={{ ...sectionHeadingStyle, color: 'var(--danger-color)' }}><ShieldAlert size={20} /> Danger Zone</h2>
        <p style={sectionSubtextStyle}>Permanently delete your account. This cannot be undone.</p>
      </div>

      {!confirming ? (
        <button type="button" className="btn-danger" style={{ alignSelf: 'flex-start' }} onClick={() => setConfirming(true)}>
          Delete Account
        </button>
      ) : (
        <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Enter your password to confirm account deletion.</p>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          {error && <p style={{ color: 'var(--danger-color)', margin: 0, fontSize: '0.9rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-danger" disabled={submitting}>{submitting ? 'Deleting…' : 'Confirm Delete'}</button>
            <button type="button" className="btn-secondary" onClick={() => { setConfirming(false); setPassword(''); setError(''); }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export const Settings: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentAdmin } = useAppContext();
  const [activeSection, setActiveSection] = useState<SectionId>('profile');

  // Prevent background scrolling and interaction while the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
      }}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{ width: '100%', maxWidth: '820px', height: '640px', maxHeight: '85vh', margin: '0 24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '32px 32px 24px 32px', flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Settings</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0 0', fontSize: '1rem' }}>Manage your account preferences.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            title="Close settings"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '10px',
              border: '1px solid var(--border-color)', backgroundColor: 'transparent',
              color: 'var(--text-secondary)', flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {!currentAdmin ? (
          <div style={{ padding: '0 32px 32px 32px' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Settings are only available for signed-in accounts.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', padding: '0 32px 32px 32px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
            <div style={{ width: '200px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {SECTIONS.map(section => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                    borderRadius: '8px', textAlign: 'left', fontSize: '0.9rem', fontWeight: 500,
                    backgroundColor: activeSection === section.id ? 'var(--bg-color)' : 'transparent',
                    color: section.id === 'danger'
                      ? 'var(--danger-color)'
                      : (activeSection === section.id ? 'var(--text-primary)' : 'var(--text-secondary)')
                  }}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {activeSection === 'profile' && <ProfileSection />}
              {activeSection === 'security' && <SecuritySection />}
              {activeSection === 'appearance' && <AppearanceSection />}
              {activeSection === 'notifications' && <NotificationsSection />}
              {activeSection === 'danger' && <DangerZoneSection />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
