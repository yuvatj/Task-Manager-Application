import React, { useState } from 'react';
import { LogIn, User } from 'lucide-react';
import { useAppContext } from '../store';

const handleUserLogin = () => {
  localStorage.setItem('taskmgr_role', 'user');
  window.location.href = window.location.origin + window.location.pathname;
};

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

export const Login: React.FC = () => {
  const { signupAdmin, loginAdmin } = useAppContext();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const switchMode = (next: 'signin' | 'signup') => {
    setMode(next);
    resetFields();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const result = mode === 'signin'
      ? await loginAdmin(email, password)
      : await signupAdmin(name, email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '48px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            <LogIn size={24} style={{ verticalAlign: '-4px', marginRight: '8px' }} />
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            {mode === 'signin' ? 'Sign in to access your task manager.' : 'Sign up to manage tasks and projects.'}
          </p>
        </div>

        <div style={{ display: 'flex', borderRadius: '10px', backgroundColor: 'var(--bg-color-secondary)', padding: '4px' }}>
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={mode === 'signin' ? 'btn-primary' : 'btn-secondary'}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={mode === 'signup' ? 'btn-primary' : 'btn-secondary'}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'signup' ? 8 : undefined}
            style={inputStyle}
          />
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
            />
          )}

          {error && <p style={{ color: 'var(--danger-color)', margin: 0, fontSize: '0.9rem' }}>{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '1.05rem' }}
          >
            <LogIn size={20} /> {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          or
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        <button
          className="btn-secondary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '1.05rem' }}
          onClick={handleUserLogin}
        >
          <User size={20} /> Continue as Guest
        </button>
      </div>
    </div>
  );
};
