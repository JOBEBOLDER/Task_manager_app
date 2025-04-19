// src/screens/HomeScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Animated,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';

/**
 * Task interface defining the structure of a task item
 * Using literal types for status ensures type safety
 */
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

// Type for the navigation prop specific to the HomeScreen
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

/**
 * Props for HomeScreen component
 * Includes navigation and task management callbacks
 */
interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  tasks: Task[];
  onAddTask: (task: Task) => void;     // Callback to add a new task
  onUpdate: (task: Task) => void;      // Callback to update an existing task
  onDelete: (id: string) => void;      // Callback to delete a task
}

/**
 * HomeScreen component displays a list of tasks with search and filtering capabilities
 * Includes animations and task management functionality
 */
const HomeScreen: React.FC<HomeScreenProps> = ({
                                                 navigation,
                                                 tasks,
                                                 onAddTask,
                                                 onUpdate,
                                                 onDelete
                                               }) => {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');

  // Animated value for scroll position to drive header animations
  const scrollY = useRef(new Animated.Value(0)).current;

  // Interpolate search bar height based on scroll position
  const searchBarHeight = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [60, 45],
    extrapolate: 'clamp'
  });

  // Use a fixed font size to avoid animation errors
  const fixedFontSize = 16;

  /**
   * Clears the search input and dismisses keyboard
   */
  const clearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };

  /**
   * Navigates to task detail screen with the selected task
   * @param task - The task to view or edit
   */
  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetailScreen', {
      task,
      onUpdate,
      onDelete
    });
  };

  /**
   * Navigates to task form screen to create a new task
   */
  const handleAddTask = () => {
    navigation.navigate('TaskFormScreen', {
      onSave: (newTask: Task) => {
        onAddTask(newTask);
      }
    });
  };

  /**
   * Toggles a task's status between 'pending' and 'completed'
   * @param id - ID of the task to update
   */
  const handleToggleStatus = (id: string) => {
    const taskToUpdate = tasks.find(task => task.id === id);
    if (taskToUpdate) {
      const updatedTask: Task = {
        ...taskToUpdate,
        status: taskToUpdate.status === 'completed' ? 'pending' : 'completed'
      };
      onUpdate(updatedTask);
    }
  };

  /**
   * Highlights matching text in search results
   * @param text - The text to search within
   * @param highlight - The search term to highlight
   * @returns - Text with highlighted search matches
   */
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;

    // Create regex for case-insensitive matching
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    // Return text with highlighted parts
    return parts.map((part, i) =>
        regex.test(part) ?
            <Text key={i} style={{ backgroundColor: '#fff9c4', fontWeight: '700' }}>{part}</Text> :
            part
    );
  };

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Sort tasks with the following priority:
   * 1. Status: pending tasks before completed
   * 2. Date: newest tasks first
   */
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by status first (pending before completed)
    if (a.status === 'pending' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'pending') return 1;

    // Then sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  /**
   * Renders an individual task item in the list
   * @param item - Task to render
   */
  const renderTaskItem = ({ item }: { item: Task }) => (
      <TouchableOpacity
          style={[
            styles.taskItem,
            item.status === 'completed' && styles.completedTask
          ]}
          onPress={() => handleTaskPress(item)}
      >
        {/* Task information section */}
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {searchQuery ? highlightText(item.title, searchQuery) : item.title}
          </Text>

          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description || 'No description'}
          </Text>

          <Text style={styles.taskDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {/* Task status badge */}
        <View style={styles.taskStatus}>
          <Text style={[
            styles.statusText,
            item.status === 'completed' ? styles.completedText : styles.pendingText
          ]}>
            {item.status === 'completed' ? 'Completed' : 'Pending'}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {/* Toggle status button */}
          <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleStatus(item.id)}
          >
            <Text>{item.status === 'completed' ? '↺' : '✓'}</Text>
          </TouchableOpacity>

          {/* Delete button */}
          <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(item.id)}
          >
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
  );

  return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          {/* Animated search bar that shrinks on scroll */}
          <Animated.View style={[
            styles.searchContainer,
            {
              height: searchBarHeight,
              paddingVertical: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [12, 8],
                extrapolate: 'clamp'
              })
            }
          ]}>
            <View style={styles.searchInputContainer}>
              <TextInput
                  style={[
                    styles.searchInput,
                    { fontSize: fixedFontSize }
                  ]}
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  clearButtonMode="while-editing"
              />
              {/* Clear search button appears when there's text */}
              {searchQuery.length > 0 && (
                  <TouchableOpacity
                      style={styles.clearButton}
                      onPress={clearSearch}
                  >
                    <Text style={styles.clearButtonText}>✕</Text>
                  </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Task list with animation on scroll */}
          <FlatList
              data={sortedTasks}
              renderItem={renderTaskItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                  { useNativeDriver: false }
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery
                        ? 'No matching tasks found'
                        : 'No tasks yet'
                    }
                  </Text>
                  <Text style={styles.emptySubText}>
                    {searchQuery
                        ? 'Try a different search term'
                        : 'Press the "+" button to create a new task'
                    }
                  </Text>
                </View>
              }
          />

          {/* Floating action button to add a new task */}
          <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddTask}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableWithoutFeedback>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  clearButton: {
    position: 'absolute',
    right: 8,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  taskDate: {
    fontSize: 11,
    color: '#999',
  },
  taskStatus: {
    justifyContent: 'center',
    marginRight: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pendingText: {
    backgroundColor: '#fff8e1',
    color: '#f57c00',
  },
  completedText: {
    backgroundColor: '#e8f5e9',
    color: '#4caf50',
  },
  actions: {
    justifyContent: 'center',
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 32,
    fontWeight: '300',
    color: '#fff',
    marginTop: -2,
  },
});

export default HomeScreen;