// src/screens/TaskDetailScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

/**
 * Task interface with literal types for status
 */
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
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

// Spacing scale for consistency across the app
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

// Navigation prop types
type RootStackParamList = {
  TaskFormScreen: { task: Task; onSave: (task: Task) => void };
};

type TaskDetailScreenRouteProp = RouteProp<{
  params: {
    task: Task;
    onUpdate: (task: Task) => void;
    onDelete: (id: string) => void;
  };
}, 'params'>;

type TaskDetailScreenNavigationProp = StackNavigationProp<RootStackParamList>;

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

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Update local task state if initialTask changes
  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

  // Start fade-in animation when component mounts
  useEffect(() => {
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
    // Store the old status for undo functionality
    const oldStatus = task.status;

    // Use explicit literal type for the new status for type safety
    const newStatus: 'pending' | 'completed' =
        task.status === 'completed' ? 'pending' : 'completed';

    // Create updated task
    const updatedTask = { ...task, status: newStatus };

    // Update local state
    setTask(updatedTask);

    // Update parent state
    onUpdate(updatedTask);

    // Provide undo option
    Alert.alert(
        'Status Changed',
        `Task marked as ${newStatus}`,
        [
          { text: 'OK' },
          {
            text: 'Undo',
            onPress: () => {
              const revertedTask = { ...task, status: oldStatus };
              setTask(revertedTask);
              onUpdate(revertedTask);
            }
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

        // Update parent state
        onUpdate(updatedTask);

        // Alert to confirm update
        Alert.alert(
            'Task Updated',
            'The task has been successfully updated.'
        );
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
          { text: 'Cancel' },
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

  // Memoize dynamically computed styles to avoid recreation on each render
  const computedStyles = useMemo(() => ({
    statusBadge: [
      styles.statusBadge,
      task.status === 'completed' ? styles.completedBadge : styles.pendingBadge
    ],
    statusText: [
      styles.statusText,
      task.status === 'completed' ? styles.completedText : styles.pendingText
    ],
    toggleButton: [
      styles.button,
      task.status === 'completed' ? styles.pendingButton : styles.completeButton
    ]
  }), [task.status]);

  // StatusBadge component to improve readability in render function
  const StatusBadge = () => (
      <View style={styles.statusContainer}>
        <View style={computedStyles.statusBadge}>
          <Text style={computedStyles.statusText}>
            {task.status === 'completed' ? 'Completed' : 'Pending'}
          </Text>
        </View>
      </View>
  );

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
            <StatusBadge />
          </View>

          {/* Action buttons */}
          <View style={styles.buttonsContainer}>
            {/* Dynamic toggle status button with icon */}
            <TouchableOpacity
                style={computedStyles.toggleButton}
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
    padding: SPACING.md,
    margin: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.text.primary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
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
  statusContainer: {
    marginTop: SPACING.xs,
  },
  statusBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
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
    margin: SPACING.md,
    marginTop: SPACING.sm,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 1,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
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