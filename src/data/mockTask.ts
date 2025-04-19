// src/data/mockTasks.ts
import { Task } from '../types';

// Mock tasks for testing purposes
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Example Task',
    description: 'This is an example task for testing purposes',
    createdAt: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: '2',
    title: 'Read React Native Documentation',
    description: 'Learn about navigation and state management in React Native',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: 'pending',
  },
  {
    id: '3',
    title: 'Complete Tutorial',
    description: 'Finish the React Native task manager tutorial',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: 'completed',
  },
];