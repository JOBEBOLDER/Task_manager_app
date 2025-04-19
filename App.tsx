// App.tsx - Main application component
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import TaskFormScreen from './src/screens/TaskFormScreen';
import { Task, RootStackParamList } from './src/types';
import { mockTasks } from './src/data/mockTask';

/**
 * Create a stack navigator with typed routes
 * This ensures type safety when navigating between screens
 */
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Main application component
 * Manages global task state and navigation structure
 */
export default function App() {
    // Global state for tasks, initialized with mock data
    const [tasks, setTasks] = useState<Task[]>(mockTasks);

    /**
     * Adds a new task to the global task list
     * @param newTask - The task object to add
     */
    const handleAddTask = (newTask: Task) => {
        setTasks([...tasks, newTask]);
    };

    /**
     * Updates an existing task in the global task list
     * @param updatedTask - The modified task object with the same ID
     */
    const handleUpdateTask = (updatedTask: Task) => {
        setTasks(tasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
        ));
    };

    /**
     * Removes a task from the global task list
     * @param taskId - ID of the task to delete
     */
    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    return (
        <NavigationContainer>
            {/* Stack navigator with shared header styling */}
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
                {/* Home screen with task management props */}
                <Stack.Screen
                    name="Home"
                    options={{ title: 'My Tasks' }}
                >
                    {/* Pass props to HomeScreen using render pattern */}
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

                {/* Task detail screen for viewing individual tasks */}
                <Stack.Screen
                    name="TaskDetailScreen"
                    options={{ title: 'Task Details' }}
                    component={TaskDetailScreen}
                />

                {/* Task form screen for creating/editing tasks with dynamic title */}
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