import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, Project, User } from './types';

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
}

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  users: User[]; // Users for assignment
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  activeProjectFilter: string | null;
  setActiveProjectFilter: (id: string | null) => void;
  currentUserRole: 'admin' | 'user' | null;
  setCurrentUserRole: (role: 'admin' | 'user' | null) => void;
  currentAdmin: AdminAccount | null;
  signupAdmin: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  loginAdmin: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  updateProfileName: (name: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  deleteAccount: (password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


const API_URL = 'http://localhost:5000/api';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeProjectFilter, setActiveProjectFilter] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'user' | null>(() => {
    return (localStorage.getItem('taskmgr_role') as 'admin' | 'user') || null;
  });
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(() => {
    const stored = localStorage.getItem('taskmgr_admin');
    return stored ? JSON.parse(stored) : null;
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('taskmgr_theme') as 'light' | 'dark') || 'light';
  });

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/projects`),
          fetch(`${API_URL}/tasks`),
          fetch(`${API_URL}/users`)
        ]);
        
        const [projData, taskData, userData] = await Promise.all([
          projectsRes.json(),
          tasksRes.json(),
          usersRes.json()
        ]);
        
        setProjects(projData);
        setTasks(taskData);
        setUsers(userData);
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
    if (currentAdmin) localStorage.setItem('taskmgr_admin', JSON.stringify(currentAdmin));
    else localStorage.removeItem('taskmgr_admin');
  }, [currentAdmin]);

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
      setCurrentAdmin(data);
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
      localStorage.setItem('taskmgr_role', 'admin');
      setCurrentAdmin(data);
      setCurrentUserRole('admin');
      return { ok: true };
    } catch (error) {
      console.error('Error logging in:', error);
      return { ok: false, error: 'Could not reach the server' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!currentAdmin) return { ok: false, error: 'Not signed in' };
    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentAdmin.id, currentPassword, newPassword })
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
    if (!currentAdmin) return { ok: false, error: 'Not signed in' };
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentAdmin.id, name })
      });
      const data = await response.json();
      if (!response.ok) return { ok: false, error: data.error || 'Could not update profile' };
      localStorage.setItem('taskmgr_admin', JSON.stringify(data));
      setCurrentAdmin(data);
      return { ok: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { ok: false, error: 'Could not reach the server' };
    }
  };

  const deleteAccount = async (password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (!currentAdmin) return { ok: false, error: 'Not signed in' };
    try {
      const response = await fetch(`${API_URL}/auth/account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentAdmin.id, password })
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
    updateTask(id, { status });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const updatedTask = await response.json();
      setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
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
    <AppContext.Provider value={{ projects, tasks, users, addProject, addTask, updateTaskStatus, updateTask, deleteTask, activeProjectFilter, setActiveProjectFilter, currentUserRole, setCurrentUserRole, currentAdmin, signupAdmin, loginAdmin, changePassword, updateProfileName, deleteAccount, theme, setTheme }}>
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
