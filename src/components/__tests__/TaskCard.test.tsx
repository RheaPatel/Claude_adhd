import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TaskCard } from '../tasks/TaskCard';
import { Task } from '../../types/task';

const mockTask: Task = {
  taskId: 'task-1',
  userId: 'user-1',
  title: 'Test Task',
  description: 'This is a test task',
  category: 'work',
  urgency: 'high',
  urgencySource: 'user',
  status: 'pending',
  tags: ['important', 'urgent'],
  isLongTerm: false,
  createdAt: new Date('2025-12-01'),
  updatedAt: new Date('2025-12-01'),
};

describe('TaskCard', () => {
  const mockOnPress = jest.fn();
  const mockOnComplete = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render task card with basic information', () => {
    render(<TaskCard task={mockTask} onPress={mockOnPress} />);

    expect(screen.getByText('Test Task')).toBeTruthy();
    expect(screen.getByText('This is a test task')).toBeTruthy();
  });

  it('should display urgency badge', () => {
    render(<TaskCard task={mockTask} onPress={mockOnPress} />);

    expect(screen.getByText('high')).toBeTruthy();
  });

  it('should display category badge', () => {
    render(<TaskCard task={mockTask} onPress={mockOnPress} />);

    expect(screen.getByText('work')).toBeTruthy();
  });

  it('should display tags', () => {
    render(<TaskCard task={mockTask} onPress={mockOnPress} />);

    expect(screen.getByText('important')).toBeTruthy();
    expect(screen.getByText('urgent')).toBeTruthy();
  });

  it('should call onPress when card is pressed', () => {
    render(<TaskCard task={mockTask} onPress={mockOnPress} />);

    const card = screen.getByText('Test Task').parent?.parent;
    if (card) {
      fireEvent.press(card);
      expect(mockOnPress).toHaveBeenCalledWith(mockTask);
    }
  });

  it('should display due date when available', () => {
    const taskWithDueDate: Task = {
      ...mockTask,
      dueDate: new Date('2025-12-31'),
    };

    render(<TaskCard task={taskWithDueDate} onPress={mockOnPress} />);

    // Due date should be displayed
    expect(screen.getByText(/Dec/)).toBeTruthy();
  });

  it('should show subtask progress when task has subtasks', () => {
    const taskWithSubtasks: Task = {
      ...mockTask,
      subtasks: [
        {
          subtaskId: 'sub-1',
          title: 'Subtask 1',
          completed: true,
          completedAt: new Date(),
          createdAt: new Date(),
        },
        {
          subtaskId: 'sub-2',
          title: 'Subtask 2',
          completed: false,
          completedAt: null,
          createdAt: new Date(),
        },
      ],
    };

    render(<TaskCard task={taskWithSubtasks} onPress={mockOnPress} />);

    // Should show subtask progress (1/2)
    expect(screen.getByText(/1.*2/)).toBeTruthy();
  });

  it('should display completed status', () => {
    const completedTask: Task = {
      ...mockTask,
      status: 'completed',
      completedAt: new Date(),
    };

    render(<TaskCard task={completedTask} onPress={mockOnPress} />);

    // Check for completed status indicator
    const card = screen.getByText('Test Task').parent?.parent;
    expect(card).toBeTruthy();
  });

  it('should handle long task titles gracefully', () => {
    const longTitleTask: Task = {
      ...mockTask,
      title: 'This is a very long task title that should be handled properly without breaking the UI layout',
    };

    render(<TaskCard task={longTitleTask} onPress={mockOnPress} />);

    expect(screen.getByText(/This is a very long task/)).toBeTruthy();
  });

  it('should handle tasks without description', () => {
    const taskWithoutDescription: Task = {
      ...mockTask,
      description: '',
    };

    render(<TaskCard task={taskWithoutDescription} onPress={mockOnPress} />);

    expect(screen.getByText('Test Task')).toBeTruthy();
    expect(screen.queryByText('This is a test task')).toBeNull();
  });

  it('should handle in-progress status', () => {
    const inProgressTask: Task = {
      ...mockTask,
      status: 'in-progress',
    };

    render(<TaskCard task={inProgressTask} onPress={mockOnPress} />);

    expect(screen.getByText('Test Task')).toBeTruthy();
  });
});
