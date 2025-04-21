// src/screens/TaskDetailScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

/**
 * Task interface with literal types for status
 * This ensures only valid status values can be assigned
 */
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed'; // Use literal union type for type safety
  createdAt: string;
}

/**
 * Navigation parameter list for the app's navigation stack
 * Defines the screens and their route parameters
 */
type RootStackParamList = {
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

// Type definitions for navigation props
type TaskDetailScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetailScreen'>;
type TaskDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskDetailScreen'>;

/**
 * Props interface for TaskDetailScreen component
 */
interface TaskDetailScreenProps {
  route: TaskDetailScreenRouteProp;
  navigation: TaskDetailScreenNavigationProp;
}

/**
 * TaskDetailScreen displays detailed information about a single task
 * Provides options to toggle status, edit, share, or delete the task
 */
const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ navigation, route }) => {
  const { task: initialTask, onUpdate, onDelete } = route.params;

  // Local state to manage the task
  const [task, setTask] = useState<Task>(initialTask);

  /**
   * Toggles task status between 'pending' and 'completed'
   * Updates both local state and parent component
   * Provides an undo option via alert
   */
  const handleToggleStatus = () => {
    // Use explicit literal type for the new status for type safety
    const newStatus: 'pending' | 'completed' =
        task.status === 'completed' ? 'pending' : 'completed';

    const updatedTask: Task = {
      ...task,
      status: newStatus
    };

    // Update local state
    setTask(updatedTask);

    // Call the onUpdate function passed from parent
    onUpdate(updatedTask);

    // Show confirmation with option to undo
    Alert.alert(
        'Status Changed',
        `Task marked as ${newStatus}`,
        [
          {
            text: 'OK',
            style: 'default'
          },
          {
            text: 'Undo',
            onPress: () => {
              // Revert back with explicit type
              const revertedStatus: 'pending' | 'completed' = task.status;
              const revertedTask: Task = {
                ...task,
                status: revertedStatus
              };
              setTask(revertedTask);
              onUpdate(revertedTask);
            },
            style: 'cancel'
          }
        ]
    );
  };

  /**
   * Navigates to TaskFormScreen for editing
   * Passes the current task and a callback for handling updates
   */
  const handleEdit = () => {
    navigation.navigate('TaskFormScreen', {
      task,
      onSave: (updatedTask: Task) => {
        // Update local state
        setTask(updatedTask);

        // Call the onUpdate function passed from parent
        onUpdate(updatedTask);

        // Show a confirmation message if status was changed
        if (updatedTask.status !== task.status) {
          Alert.alert(
              'Status Updated',
              `Task is now ${updatedTask.status}`
          );
        }
      }
    });
  };

  /**
   * Shares task details using the native Share API
   * Formats task information for sharing
   */
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Task: ${task.title}\nDescription: ${task.description}\nStatus: ${task.status}`,
        title: 'Share Task'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the task');
    }
  };

  /**
   * Prompts for confirmation before deleting a task
   * Returns to previous screen after deletion
   */
  const handleDelete = () => {
    Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              onDelete(task.id);
              navigation.goBack();
            }
          }
        ]
    );
  };

  /**
   * Formats a date string to a more readable format
   * @param dateString - ISO date string to format
   * @returns Formatted date string (e.g., "April 19, 2025")
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
      <ScrollView style={styles.container}>
        {/* Task details card */}
        <View style={styles.card}>
          <Text style={styles.title}>{task.title}</Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {task.description || 'No description'}
          </Text>

          <Text style={styles.sectionTitle}>Created Date</Text>
          <Text style={styles.date}>{formatDate(task.createdAt)}</Text>

          <Text style={styles.sectionTitle}>Status</Text>
          {/* Status badge with styling consistent with task list */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              task.status === 'completed' ? styles.completedBadge : styles.pendingBadge
            ]}>
              <Text style={[
                styles.statusText,
                task.status === 'completed' ? styles.completedText : styles.pendingText
              ]}>
                {task.status === 'completed' ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          {/* Dynamic toggle status button */}
          <TouchableOpacity
              style={[
                styles.button,
                task.status === 'completed' ? styles.pendingButton : styles.completeButton
              ]}
              onPress={handleToggleStatus}
          >
            <Text style={styles.buttonText}>
              {task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
            </Text>
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={handleShare}
          >
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>

          {/* Edit button */}
          <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={handleEdit}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    color: '#666',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  // Status styling - updated to match task list
  statusContainer: {
    marginTop: 8,
    flexDirection: 'row',
  },
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  pendingBadge: {
    backgroundColor: '#fff8e1',
    borderColor: '#ffb300',
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4caf50',
  },
  statusText: {
    fontWeight: '600',
    fontSize: 16,
  },
  pendingText: {
    color: '#f57c00',
  },
  completedText: {
    color: '#4caf50',
  },
  buttonsContainer: {
    margin: 16,
    marginTop: 0,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#4caf50',
  },
  pendingButton: {
    backgroundColor: '#ff9800',
  },
  shareButton: {
    backgroundColor: '#9c27b0',
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;