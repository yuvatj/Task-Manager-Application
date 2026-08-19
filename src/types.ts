export interface User {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string; // Optional image URL
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  scope?: string;
  deliverables?: ChecklistItem[];
  milestones?: Milestone[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'delivered' | 'done';
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Attachment {
  name: string;
  data: string; // Base64
}

export interface Comment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  message: string;
  actor: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string; // Foreign key
  title: string;
  description: string; // "Task description if required"
  tags: string[]; // "every task should be tagged"
  urgency: UrgencyLevel;
  startDate: string;
  deliveryDate: string;
  workingFileNames: string[]; // "working file names"
  referenceFileNames: string[]; // Deprecated: use referenceFiles
  referenceFiles: Attachment[]; // New field for actual file data
  images: string[]; // "images for explanation"
  assignee: User | null; // "assignee"
  creator: User; // "task creator details"
  engineerName: string; // "engineer name for any further clarifications"
  status: TaskStatus;
  createdAt: string;
  checklist?: ChecklistItem[];
  comments?: Comment[];
  blockedBy?: string[];
  activity?: ActivityEntry[];
}
