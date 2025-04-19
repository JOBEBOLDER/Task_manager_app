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

type TaskFormScreenRouteProp = RouteProp<RootStackParamList, 'TaskFormScreen'>;
type TaskFormScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskFormScreen'>;

interface TaskFormScreenProps {
  route: TaskFormScreenRouteProp;
  navigation: TaskFormScreenNavigationProp;
}

/**
 * Screen component for creating or editing a task
 */
const TaskFormScreen: React.FC<TaskFormScreenProps> = ({ navigation, route }) => {
  // Initialize state for the form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [titleError, setTitleError] = useState('');
  
  const { task, onSave } = route.params;
  
  // If editing an existing task, populate form fields
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
    }
  }, [task]);
  
  // Validate form data
  const validateForm = (): boolean => {
    // Reset error
    setTitleError('');
    
    // Validate title
    if (!title.trim()) {
      setTitleError('Task title cannot be empty');
      return false;
    }
    
    // Add additional validation rules if needed
    if (title.trim().length > 50) {
      setTitleError('Title must be less than 50 characters');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    const updatedTask: Task = {
      id: task ? task.id : Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      createdAt: task ? task.createdAt : new Date().toISOString(),
      status,
    };
    
    // Call the onSave function passed from the parent component
    onSave(updatedTask);
    
    // Navigate back
    navigation.goBack();
  };
  
  // Toggle task status
  const handleStatusToggle = (value: boolean) => {
    setStatus(value ? 'completed' : 'pending');
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.screenTitle}>
            {task ? 'Edit Task' : 'Create New Task'}
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.input, titleError ? styles.inputError : null]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (text.trim()) setTitleError('');
              }}
              placeholder="Enter task title"
              maxLength={50}
            />
            {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
            <Text style={styles.characterCount}>{title.length}/50</Text>
          </View>
          
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
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {task ? 'Save Changes' : 'Create Task'}
              </Text>
            </TouchableOpacity>
            
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