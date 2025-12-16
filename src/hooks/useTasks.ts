import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  archiveTask,
} from '../services/taskService';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '../types';
import { useUserStore } from '../store/userStore';

const TASKS_QUERY_KEY = 'tasks';

/**
 * Hook to fetch all tasks for the current user
 */
export const useTasks = (filters?: TaskFilters) => {
  const user = useUserStore((state) => state.user);

  return useQuery({
    queryKey: [TASKS_QUERY_KEY, user?.userId, filters],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return getTasks(user.userId, filters);
    },
    enabled: !!user,
  });
};

/**
 * Hook to fetch a single task
 */
export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, taskId],
    queryFn: () => getTask(taskId),
    enabled: !!taskId,
  });
};

/**
 * Hook to create a new task
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: (input: CreateTaskInput) => {
      if (!user) throw new Error('User not authenticated');
      return createTask(user.userId, input);
    },
    onSuccess: (newTask) => {
      // Optimistically update the tasks list
      queryClient.setQueryData<Task[]>([TASKS_QUERY_KEY, user?.userId, undefined], (old) => {
        return old ? [newTask, ...old] : [newTask];
      });

      // Invalidate queries to refetch from server
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.userId] });
    },
  });
};

/**
 * Hook to update a task
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: UpdateTaskInput }) => {
      return updateTask(taskId, updates);
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific task query
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, variables.taskId] });

      // Invalidate all tasks queries
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.userId] });
    },
  });
};

/**
 * Hook to delete a task
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: (_, taskId) => {
      // Remove from cache
      queryClient.setQueryData<Task[]>([TASKS_QUERY_KEY, user?.userId, undefined], (old) => {
        return old ? old.filter((task) => task.taskId !== taskId) : [];
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.userId] });
    },
  });
};

/**
 * Hook to complete a task
 */
export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: (taskId: string) => completeTask(taskId),
    onMutate: async (taskId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY, user?.userId] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>([TASKS_QUERY_KEY, user?.userId, undefined]);

      // Optimistically update to the new value
      queryClient.setQueryData<Task[]>([TASKS_QUERY_KEY, user?.userId, undefined], (old) => {
        if (!old) return [];
        return old.map((task) =>
          task.taskId === taskId
            ? { ...task, status: 'completed' as const, completedAt: new Date() }
            : task
        );
      });

      // Return context with the snapshot
      return { previousTasks };
    },
    onError: (err, taskId, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData([TASKS_QUERY_KEY, user?.userId, undefined], context.previousTasks);
      }
      console.error('Error completing task:', err);
    },
    onSettled: () => {
      // Invalidate all tasks queries to refetch
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.userId] });
    },
  });
};

/**
 * Hook to archive a task
 */
export const useArchiveTask = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: (taskId: string) => archiveTask(taskId),
    onSuccess: () => {
      // Invalidate all tasks queries to refetch
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.userId] });
    },
  });
};

/**
 * Hook to toggle task in-progress status
 */
export const useToggleInProgress = () => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.user);

  return useMutation({
    mutationFn: ({ taskId, currentStatus }: { taskId: string; currentStatus: 'pending' | 'in-progress' }) => {
      const newStatus = currentStatus === 'in-progress' ? 'pending' : 'in-progress';
      return updateTask(taskId, { status: newStatus });
    },
    onMutate: async ({ taskId, currentStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY, user?.userId] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>([TASKS_QUERY_KEY, user?.userId, undefined]);

      // Optimistically update to the new value
      const newStatus = currentStatus === 'in-progress' ? 'pending' : 'in-progress';
      queryClient.setQueryData<Task[]>([TASKS_QUERY_KEY, user?.userId, undefined], (old) => {
        if (!old) return [];
        return old.map((task) =>
          task.taskId === taskId
            ? { ...task, status: newStatus as 'pending' | 'in-progress' }
            : task
        );
      });

      // Return context with the snapshot
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData([TASKS_QUERY_KEY, user?.userId, undefined], context.previousTasks);
      }
      console.error('Error toggling in-progress status:', err);
    },
    onSettled: () => {
      // Invalidate all tasks queries to refetch
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, user?.userId] });
    },
  });
};

/**
 * Hook to get task statistics
 */
export const useTaskStats = () => {
  const { data: tasks = [] } = useTasks();

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    byCategory: tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byUrgency: tasks.reduce((acc, task) => {
      acc[task.urgency] = (acc[task.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
};
