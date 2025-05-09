// src/screens/TaskFormScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Switch
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Task } from '../types';

/**
 * Type definitions for route and navigation props
 * These ensure type safety when accessing route params or navigation methods
 */
type TaskFormScreenRouteProp = RouteProp<RootStackParamList, 'TaskFormScreen'>;
type TaskFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskFormScreen'>;

/**
 * Props interface for the TaskFormScreen component
 */
interface TaskFormScreenProps {
  route: TaskFormScreenRouteProp;
  navigation: TaskFormScreenNavigationProp;
}

/**
 * Screen component for creating or editing a task
 * Provides form fields for task details with validation
 */
const TaskFormScreen: React.FC<TaskFormScreenProps> = ({ navigation, route }) => {
  // State for form fields and validation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [titleError, setTitleError] = useState('');

  // Extract task and onSave callback from route params
  const { task, onSave } = route.params;

  /**
   * Populate form fields when editing an existing task
   * Only runs when the task prop changes
   */
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
  }, [task]);

  /**
   * Validates form data before submission
   * Checks for required fields and length constraints
   * @returns boolean indicating if the form is valid
   */
  const validateForm = (): boolean => {
    // Reset error state
    setTitleError('');

    // Validate title presence
    if (!title.trim()) {
      setTitleError('Task title cannot be empty');
      return false;
    }

    // Validate title length
    if (title.trim().length > 50) {
      setTitleError('Title must be less than 50 characters');
      return false;
    }

    return true;
  };

  /**
   * Handles form submission after validation
   * Creates a new task or updates an existing one
   */
  const handleSave = () => {
    // Exit early if validation fails
    if (!validateForm()) {
      return;
    }

    // Create or update task object
    const updatedTask: Task = {
      // Preserve ID for existing tasks or generate new ID for new tasks
      id: task ? task.id : Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      // Preserve creation date for existing tasks or set current date for new tasks
      createdAt: task ? task.createdAt : new Date().toISOString(),
      status,
    };

    // Send updated task to parent component
    onSave(updatedTask);

    // Return to previous screen
    navigation.goBack();
  };

  /**
   * Toggles task status between pending and completed
   * @param value - Boolean from Switch component (true = completed, false = pending)
   */
  const handleStatusToggle = (value: boolean) => {
    setStatus(value ? 'completed' : 'pending');
  };

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100} // Adjust offset to prevent keyboard from covering inputs
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            {/* Dynamic title based on whether we're creating or editing */}
            <Text style={styles.screenTitle}>
              {task ? 'Edit Task' : 'Create New Task'}
            </Text>

            {/* Title input with validation */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
              <TextInput
                  style={[styles.input, titleError ? styles.inputError : null]}
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                    // Clear error when user starts typing
                    if (text.trim()) setTitleError('');
                  }}
                  placeholder="Enter task title"
                  maxLength={50} // Enforce character limit
              />
              {/* Error message display */}
              {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
              {/* Character counter for title */}
              <Text style={styles.characterCount}>{title.length}/50</Text>
            </View>

            {/* Description input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter task description"
                  multiline
                  numberOfLines={4}
              />
            </View>

            {/* Status toggle switch */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.statusToggle}>
                <Text style={status === 'completed' ? styles.statusTextInactive : styles.statusTextActive}>
                  Pending
                </Text>
                <Switch
                    value={status === 'completed'}
                    onValueChange={handleStatusToggle}
                    trackColor={{ false: '#dddddd', true: '#81b0ff' }}
                    thumbColor={status === 'completed' ? '#2196f3' : '#f5f5f5'}
                    ios_backgroundColor="#dddddd"
                    style={styles.switch}
                />
                <Text style={status === 'completed' ? styles.statusTextActive : styles.statusTextInactive}>
                  Completed
                </Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.buttonGroup}>
              {/* Save button with dynamic text */}
              <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {task ? 'Save Changes' : 'Create Task'}
                </Text>
              </TouchableOpacity>

              {/* Cancel button */}
              <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
};

// Component styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  switch: {
    marginHorizontal: 10,
  },
  statusTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusTextInactive: {
    fontSize: 16,
    color: '#999',
  },
});

export default TaskFormScreen;