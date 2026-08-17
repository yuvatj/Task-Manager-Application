import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Task, Project, User } from './types';

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
    <AppContext.Provider value={{ projects, tasks, users, addProject, addTask, updateTaskStatus, updateTask, deleteTask, activeProjectFilter, setActiveProjectFilter, currentUserRole, setCurrentUserRole }}>
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
