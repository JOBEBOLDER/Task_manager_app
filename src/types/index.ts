// src/types/index.ts

/**
 * Interface representing a task in the application
 */
export interface Task {
    /** Unique identifier for the task */
    id: string;
    /** Title of the task */
    title: string;
    /** Description of the task */
    description: string;
    /** Status of the task - either pending or completed */
    status: 'pending' | 'completed';
    /** ISO string representing when the task was created */
    createdAt: string;
  }
  
  /**
   * Navigation parameter types for the app
   */
  export type RootStackParamList = {
    Home: undefined;
    TaskDetailScreen: {
      task: Task;
      onUpdate: (task: Task) => void;
      onDelete: (id: string) => void;
    };
    TaskFormScreen: {
      task?: Task;
      onSave: (task: Task) => void;
    };
  };