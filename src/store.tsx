import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Project, User } from './types';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
}

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  users: User[]; // Users for assignment
  members: UserAccount[];
  createMember: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  deleteMember: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  activeProjectFilter: string | null;
  setActiveProjectFilter: (id: string | null) => void;
  currentUserRole: 'admin' | 'member' | 'user' | null;
  setCurrentUserRole: (role: 'admin' | 'member' | 'user' | null) => void;
  currentAccount: UserAccount | null;
  signupAdmin: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  updateProfileName: (name: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  deleteAccount: (password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentActorName: string;
  toast: string | null;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


const API_URL = 'http://localhost:5000/api';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<UserAccount[]>([]);
  const [activeProjectFilter, setActiveProjectFilter] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'member' | 'user' | null>(() => {
    return (localStorage.getItem('taskmgr_role') as 'admin' | 'member' | 'user') || null;
  });
  const [currentAccount, setCurrentAccount] = useState<UserAccount | null>(() => {
    const stored = localStorage.getItem('taskmgr_admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('taskmgr_theme') as 'light' | 'dark') || 'light';
  });
  const [toast, setToast] = useState<string | null>(null);

  const currentActorName = currentAccount?.name || 'Guest';

  const showToast = (message: string) => setToast(message);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes, usersRes, membersRes] = await Promise.all([
          fetch(`${API_URL}/projects`),
          fetch(`${API_URL}/tasks`),
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/auth/members`)
        ]);

        const [projData, taskData, userData, memberData] = await Promise.all([
          projectsRes.json(),
          tasksRes.json(),
          usersRes.json(),
          membersRes.json()
        ]);

        setProjects(projData);
        setTasks(taskData);
        setUsers(userData);
        setMembers(memberData);
      } catch (error) {
        console.error('Error fetching data from API:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUserRole) localStorage.setItem('taskmgr_role', currentUserRole);
    else localStorage.removeItem('taskmgr_role');
  }, [currentUserRole]);

  useEffect(() => {
    if (currentAccount) localStorage.setItem('taskmgr_admin', JSON.stringify(currentAccount));
    else localStorage.removeItem('taskmgr_admin');
  }, [currentAccount]);

  useEffect(() => {
    localStorage.setItem('taskmgr_theme', theme);
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  const setTheme = (next: 'light' | 'dark') => setThemeState(next);

  const signupAdmin = async (name: string, email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, error: data.error || 'Signup failed' };
      localStorage.setItem('taskmgr_admin', JSON.stringify(data));
      localStorage.setItem('taskmgr_role', 'admin');
      setCurrentAccount(data);
      setCurrentUserRole('admin');
      return { ok: true };
    } catch (error) {
      console.error('Error signing up:', error);
      return { ok: false, error: 'Could not reach the server' };
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, error: data.error || 'Login failed' };
      localStorage.setItem('taskmgr_admin', JSON.stringify(data));
      localStorage.setItem('taskmgr_role', data.role);
      setCurrentAccount(data);
      setCurrentUserRole(data.role);
      return { ok: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return { ok: false, error: 'Could not reach the server' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!currentAccount) return { ok: false, error: 'Not signed in' };
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentAccount.id, currentPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, error: data.error || 'Could not change password' };
      return { ok: true };
    } catch (error) {
      console.error('Error changing password:', error);
      return { ok: false, error: 'Could not reach the server' };
    }
  };

  const updateProfileName = async (name: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!currentAccount) return { ok: false, error: 'Not signed in' };
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentAccount.id, name })
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, error: data.error || 'Could not update profile' };
      localStorage.setItem('taskmgr_admin', JSON.stringify(data));
      setCurrentAccount(data);
      return { ok: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { ok: false, error: 'Could not reach the server' };
    }
  };

  const deleteAccount = async (password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!currentAccount) return { ok: false, error: 'Not signed in' };
    try {
      const response = await fetch(`${API_URL}/auth/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentAccount.id, password })
      });
      if (!response.ok) {
        const data = await response.json();
        return { ok: false, error: data.error || 'Could not delete account' };
      }
      localStorage.removeItem('taskmgr_admin');
      localStorage.removeItem('taskmgr_role');
      return { ok: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      return { ok: false, error: 'Could not reach the server' };
    }
  };

  const createMember = async (name: string, email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/create-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, error: data.error || 'Could not create member' };
      setMembers(prev => [...prev, data]);
      return { ok: true };
    } catch (error) {
      console.error('Error creating member:', error);
      return { ok: false, error: 'Could not reach the server' };
    }
  };

  const deleteMember = async (id: string) => {
    try {
      await fetch(`${API_URL}/auth/members/${id}`, { method: 'DELETE' });
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      const newProject = await response.json();
      setProjects(prev => [...prev || [], newProject]);
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    // Merge the fields we just sent, not the server's full response — two rapid
    // edits can resolve out of order, and replacing the whole object with
    // whichever response lands last would silently drop the other edit.
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    try {
      await fetch(`${API_URL}/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      const newTask = await response.json();
      console.log('[Store] Task saved to backend:', newTask.id);
      setTasks(prev => [...prev || [], newTask]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    const updates: Partial<Task> = { status };

    if (task && status === 'done' && task.status !== 'done') {
      const entry = { id: uuidv4(), message: 'Marked as Done', actor: currentActorName, createdAt: new Date().toISOString() };
      updates.activity = [...(task.activity || []), entry];
      showToast(`"${task.title}" marked as done`);
    }

    updateTask(id, updates);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Merge the fields we just sent, not the server's full response — see the
    // same note in updateProject above.
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE'
      });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <AppContext.Provider value={{ projects, tasks, users, members, createMember, deleteMember, addProject, updateProject, addTask, updateTaskStatus, updateTask, deleteTask, activeProjectFilter, setActiveProjectFilter, currentUserRole, setCurrentUserRole, currentAccount, signupAdmin, loginAdmin, changePassword, updateProfileName, deleteAccount, theme, setTheme, currentActorName, toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
