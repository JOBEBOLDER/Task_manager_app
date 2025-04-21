// src/screens/TaskDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Share,
  StatusBar,
  Animated
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo icons

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

// Theme constants
const COLORS = {
  primary: '#3f51b5',
  secondary: '#00bcd4',
  background: '#f5f7fa',
  card: '#ffffff',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999'
  },
  status: {
    pending: {
      background: '#fff8e1',
      border: '#ffb300',
      text: '#f57c00'
    },
    completed: {
      background: '#e8f5e9',
      border: '#4caf50',
      text: '#4caf50'
    }
  },
  button: {
    complete: '#4caf50',
    pending: '#ff9800',
    share: '#9c27b0',
    edit: '#2196f3',
    delete: '#f44336',
    text: '#ffffff'
  }
};

/**
 * TaskDetailScreen displays detailed information about a single task
 * Provides options to toggle status, edit, share, or delete the task
 */
const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ navigation, route }) => {
  const { task: initialTask, onUpdate, onDelete } = route.params;

  // Local state to manage the task
  const [task, setTask] = useState<Task>(initialTask);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Start fade-in animation when component mounts
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);

  /**
   * Toggles task status between 'pending' and 'completed'
   * Updates both local state and parent component
   * Provides an undo option via alert
   */
  const handleToggleStatus = useCallback(() => {
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
  }, [task, onUpdate]);

  /**
   * Navigates to TaskFormScreen for editing
   * Passes the current task and a callback for handling updates
   */
  const handleEdit = useCallback(() => {
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
  }, [navigation, task, onUpdate]);

  /**
   * Shares task details using the native Share API
   * Formats task information for sharing
   */
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Task: ${task.title}\nDescription: ${task.description}\nStatus: ${task.status}`,
        title: 'Share Task'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the task');
    }
  }, [task]);

  /**
   * Prompts for confirmation before deleting a task
   * Returns to previous screen after deletion
   */
  const handleDelete = useCallback(() => {
    Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              // Fade out animation before navigation
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
              }).start(() => {
                onDelete(task.id);
                navigation.goBack();
              });
            }
          }
        ]
    );
  }, [navigation, task.id, onDelete, fadeAnim]);

  /**
   * Formats a date string to a more readable format
   * @param dateString - ISO date string to format
   * @returns Formatted date string (e.g., "April 19, 2025")
   */
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  return (
      <>
        <StatusBar barStyle="dark-content" />
        <Animated.ScrollView
            style={[styles.container, { opacity: fadeAnim }]}
            showsVerticalScrollIndicator={false}
        >
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
            {/* Dynamic toggle status button with icon */}
            <TouchableOpacity
                style={[
                  styles.button,
                  task.status === 'completed' ? styles.pendingButton : styles.completeButton
                ]}
                onPress={handleToggleStatus}
            >
              <Ionicons
                  name={task.status === 'completed' ? 'reload' : 'checkmark'}
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
              </Text>
            </TouchableOpacity>

            {/* Share button with icon */}
            <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={handleShare}
            >
              <Ionicons name="share-outline" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Share</Text>
            </TouchableOpacity>

            {/* Edit button with icon */}
            <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            {/* Delete button with icon */}
            <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: COLORS.text.secondary,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.primary,
  },
  date: {
    fontSize: 16,
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.status.pending.background,
    borderColor: COLORS.status.pending.border,
  },
  completedBadge: {
    backgroundColor: COLORS.status.completed.background,
    borderColor: COLORS.status.completed.border,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 16,
  },
  pendingText: {
    color: COLORS.status.pending.text,
  },
  completedText: {
    color: COLORS.status.completed.text,
  },
  buttonsContainer: {
    margin: 16,
    marginTop: 8,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: COLORS.button.complete,
  },
  pendingButton: {
    backgroundColor: COLORS.button.pending,
  },
  shareButton: {
    backgroundColor: COLORS.button.share,
  },
  editButton: {
    backgroundColor: COLORS.button.edit,
  },
  deleteButton: {
    backgroundColor: COLORS.button.delete,
  },
  buttonText: {
    color: COLORS.button.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;