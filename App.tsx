import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import { Task, RootStackParamList } from './src/types';
import { mockTasks } from './src/data/mockTask';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  // State to hold all tasks
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  // Add a new task
  const handleAddTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  // Update an existing task
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
  };

  // Delete a task
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f8f8',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          options={{ title: 'My Tasks' }}
        >
          {props => (
            <HomeScreen 
              {...props} 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen 
          name="TaskDetailScreen"
          options={{ title: 'Task Details' }}
          component={TaskDetailScreen}
        />
        
        <Stack.Screen 
          name="TaskFormScreen"
          options={({ route }) => ({ 
            title: route.params.task ? 'Edit Task' : 'Create Task'
          })}
          component={TaskFormScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}