// src/components/TaskItem.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

/**
 * Task interface with literal types for status
 * Using literal types ensures only valid status values are used
 */
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

/**
 * Props for the TaskItem component
 * Includes callbacks for task interactions
 */
interface TaskItemProps {
  task: Task;
  onPress: (id: string) => void;         // Handler for selecting a task
  onToggleStatus: (id: string) => void;  // Handler for toggling completion status
  onDelete: (id: string) => void;        // Handler for deleting a task
}

/**
 * TaskItem component displays an individual task with status indicators
 * and action buttons for toggling status and deletion
 */
const TaskItem: React.FC<TaskItemProps> = ({
                                             task,
                                             onPress,
                                             onToggleStatus,
                                             onDelete
                                           }) => {
  /**
   * Converts ISO date string to localized date format
   * @param dateString - ISO date string
   * @returns Formatted date string according to user's locale
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
      <TouchableOpacity
          style={[
            styles.container,
            // Apply different styling for completed tasks
            task.status === 'completed' && styles.completedTask
          ]}
          onPress={() => onPress(task.id)}
      >
        {/* Main content area with task details */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{task.title}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {task.description || 'No description'}
          </Text>

          {/* Metadata row with date and status badge */}
          <View style={styles.metaRow}>
            <Text style={styles.date}>{formatDate(task.createdAt)}</Text>

            {/* Status badge with dynamic styling based on task status */}
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

        {/* Action buttons container for status toggle and delete */}
        <View style={styles.buttonsContainer}>
          {/* Toggle status button - shows different icon based on current status */}
          <TouchableOpacity
              style={[
                styles.actionButton,
                task.status === 'completed' ? styles.pendingButton : styles.completeButton
              ]}
              onPress={() => onToggleStatus(task.id)}
          >
            <Text style={styles.actionButtonText}>
              {task.status === 'completed' ? '↺' : '✓'}
            </Text>
          </TouchableOpacity>

          {/* Delete task button */}
          <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(task.id)}
          >
            <Text style={styles.actionButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  completedTask: {
    backgroundColor: '#f5f5f5',
    opacity: 0.8,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  // Status styling consistent with details screen
  statusBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontSize: 12,
  },
  pendingText: {
    color: '#f57c00',
  },
  completedText: {
    color: '#4caf50',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 10,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  completeButton: {
    backgroundColor: '#e0f7fa',
  },
  pendingButton: {
    backgroundColor: '#fff3e0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    fontSize: 16,
  },
});

export default TaskItem;