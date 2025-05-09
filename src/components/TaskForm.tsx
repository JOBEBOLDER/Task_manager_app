// components/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Task } from '../types';

/**
 * Interface for TaskForm props
 * @property {Task} task - Optional existing task for edit mode
 * @property {Function} onSubmit - Handler for form submission
 * @property {Function} onCancel - Handler for cancellation
 */
interface TaskFormProps {
  task?: Task; // Optional property, used for editing existing tasks
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

/**
 * Form component for creating or editing tasks
 * Handles validation and submission of task data
 */
const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Populate form fields when editing an existing task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task]);

  /**
   * Validates and processes form submission
   * Ensures title is not empty before submitting
   */
  const handleSubmit = () => {
    // Form validation - title is required
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setError(''); // Clear any previous errors

    // Create task object and pass to parent component
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status: task ? task.status : 'pending', // Preserve status when editing
    });

    // Reset form fields after submission
    setTitle('');
    setDescription('');
  };

  return (
      <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
      >
        {/* Dynamic title based on whether we're adding or editing */}
        <Text style={styles.formTitle}>{task ? 'Edit Task' : 'Add New Task'}</Text>

        {/* Conditional error message display */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Task title input field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
          />
        </View>

        {/* Task description input field */}
        <View style={styles.inputContainer}>
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

        {/* Action buttons container */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={[styles.buttonText, styles.submitButtonText]}>
              {task ? 'Update' : 'Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  submitButtonText: {
    color: 'white',
  },
});

export default TaskForm;