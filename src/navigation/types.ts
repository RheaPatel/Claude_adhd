import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

// Auth Stack Parameter List
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

// Task Stack Parameter List
export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  AddTask: undefined;
  EditTask: { taskId: string };
};

// Wellness Stack Parameter List
export type WellnessStackParamList = {
  Wellness: undefined;
  CheckInHistory: undefined;
};

// Settings Stack Parameter List
export type SettingsStackParamList = {
  Settings: undefined;
  NotificationSettings: undefined;
  Profile: undefined;
};

// Main Tab Parameter List
export type MainTabParamList = {
  TasksTab: undefined;
  WellnessTab: undefined;
  SettingsTab: undefined;
};

// Root Stack Parameter List
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Navigation prop types
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type TaskNavigationProp = NativeStackNavigationProp<TaskStackParamList>;
export type WellnessNavigationProp = NativeStackNavigationProp<WellnessStackParamList>;
export type SettingsNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

// Composite navigation types (for nested navigators)
export type TasksTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'TasksTab'>,
  NativeStackNavigationProp<TaskStackParamList>
>;

export type WellnessTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'WellnessTab'>,
  NativeStackNavigationProp<WellnessStackParamList>
>;

export type SettingsTabNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'SettingsTab'>,
  NativeStackNavigationProp<SettingsStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
