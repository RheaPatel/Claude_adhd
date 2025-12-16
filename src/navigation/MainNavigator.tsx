import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { AddTaskScreen } from '../screens/tasks/AddTaskScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { WellnessScreen } from '../screens/wellness/WellnessScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { MainTabParamList, TaskStackParamList } from './types';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TaskStack = createNativeStackNavigator<TaskStackParamList>();

// Task Stack Navigator
const TaskStackNavigator = () => {
  return (
    <TaskStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <TaskStack.Screen name="TaskList" component={TaskListScreen} />
      <TaskStack.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          headerShown: true,
          title: 'Add Task',
          presentation: 'modal',
        }}
      />
      <TaskStack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          headerShown: true,
          title: 'Edit Task',
        }}
      />
    </TaskStack.Navigator>
  );
};

// Main Tab Navigator
export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },
      }}
    >
      <Tab.Screen
        name="TasksTab"
        component={TaskStackNavigator}
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <Icon name="checkbox-marked-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="WellnessTab"
        component={WellnessScreen}
        options={{
          title: 'Wellness',
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
