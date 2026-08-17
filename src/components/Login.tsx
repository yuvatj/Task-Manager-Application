import React from 'react';
import { Shield, User } from 'lucide-react';

const handleLogin = (role: 'admin' | 'user') => {
  localStorage.setItem('taskmgr_role', role);
  window.location.href = window.location.origin + window.location.pathname;
};

export const Login: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-color)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '48px 32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Welcome back</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Sign in to access your task manager.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '1.05rem', backgroundColor: '#0f172a' }}
            onClick={() => handleLogin('admin')}
          >
            <Shield size={20} /> Login as Admin
          </button>
          
          <button 
            className="btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontSize: '1.05rem' }}
            onClick={() => handleLogin('user')}
          >
            <User size={20} /> Login as Regular User
          </button>
        </div>
      </div>
    </div>
  );
};
