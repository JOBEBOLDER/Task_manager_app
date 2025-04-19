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

// Define Task interface directly in this file to match the exact requirements
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  navigation, 
  tasks, 
  onAddTask,
  onUpdate, 
  onDelete 
}) => {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Animation for search bar
  const searchBarHeight = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [60, 45],
    extrapolate: 'clamp'
  });
  
  // Use a fixed font size to avoid animation errors
  const fixedFontSize = 16;
  
  // Clear search and dismiss keyboard
  const clearSearch = () => {
    setSearchQuery('');
    Keyboard.dismiss();
  };
  
  // Navigate to task detail screen
  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetailScreen', {
      task,
      onUpdate,
      onDelete
    });
  };
  
  // Navigate to task form screen to create a new task
  const handleAddTask = () => {
    navigation.navigate('TaskFormScreen', {
      onSave: (newTask: Task) => {
        onAddTask(newTask);
      }
    });
  };
  
  // Toggle task status
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
  
  // Helper function to highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? 
        <Text key={i} style={{ backgroundColor: '#fff9c4', fontWeight: '700' }}>{part}</Text> : 
        part
    );
  };
  
  // Group and filter tasks
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Sort by pending first, then by date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Sort by status first (pending before completed)
    if (a.status === 'pending' && b.status === 'completed') return -1;
    if (a.status === 'completed' && b.status === 'pending') return 1;
    
    // Then sort by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Render task item
  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={[
        styles.taskItem, 
        item.status === 'completed' && styles.completedTask
      ]} 
      onPress={() => handleTaskPress(item)}
    >
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
      
      <View style={styles.taskStatus}>
        <Text style={[
          styles.statusText,
          item.status === 'completed' ? styles.completedText : styles.pendingText
        ]}>
          {item.status === 'completed' ? 'Completed' : 'Pending'}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleToggleStatus(item.id)}
        >
          <Text>{item.status === 'completed' ? '↺' : '✓'}</Text>
        </TouchableOpacity>
        
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