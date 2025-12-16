# Testing Documentation

This document outlines the comprehensive testing strategy for the ADHD-friendly Task Management App.

## Test Setup

The project uses:
- **Jest** - Testing framework
- **React Native Testing Library** - For component testing
- **TypeScript** - Type-safe tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### Service Tests

Located in `src/services/__tests__/`

#### taskService.test.ts
Tests for task CRUD operations:
- Creating tasks with minimum and full fields
- Retrieving tasks with filters
- Updating task properties
- Completing and archiving tasks
- Error handling

#### wellnessService.test.ts
Tests for wellness check-in functionality:
- Logging different types of check-ins
- Retrieving check-ins by date range
- Calculating daily summaries
- Generating insights
- Weekly trends analysis

#### dataManagementService.test.ts
Tests for data management operations:
- Clearing completed tasks
- Clearing archived tasks
- Resetting urgency learning patterns
- Clearing wellness history
- Getting user data statistics

### Component Tests

#### TaskCard.test.tsx
Tests for the task card component:
- Rendering task information
- Displaying urgency and category badges
- Showing due dates and subtasks
- Handling user interactions
- Different task states (pending, in-progress, completed)

#### WellnessScreen.test.tsx
Tests for the wellness screen:
- Displaying quick check-in buttons
- Showing progress indicators
- Displaying mood and energy tracking
- Rendering insights
- Handling user interactions
- Loading and error states

#### SettingsScreen.test.tsx
Tests for the settings screen:
- Rendering all settings sections
- Toggling notification preferences
- Opening configuration dialogs
- Data management operations
- Confirmation dialogs
- Error handling

### Integration Tests

Located in `src/__tests__/integration/`

#### taskFlow.test.ts
End-to-end task workflow tests:
- Complete task lifecycle (create → update → complete → delete)
- Tasks with subtasks
- Filtering tasks
- Recurring tasks

#### wellnessFlow.test.ts
End-to-end wellness tracking tests:
- Full day of wellness check-ins
- Weekly trends tracking
- Insight generation
- Mood and energy tracking over time

## Test Coverage

The test suite covers:
- ✅ All service layer functions
- ✅ Core UI components
- ✅ Screen-level components
- ✅ Integration workflows
- ✅ Error handling
- ✅ Edge cases

## Mocking Strategy

### Firebase
All Firebase operations are mocked to avoid requiring a live database during tests.

### Navigation
React Navigation is mocked to isolate component behavior.

### Async Storage
AsyncStorage is mocked using the official mock from `@react-native-async-storage/async-storage`.

### Expo Modules
Expo Notifications and Device modules are mocked.

## Best Practices

1. **Arrange-Act-Assert**: Tests follow the AAA pattern
2. **Isolation**: Each test is independent
3. **Clear Naming**: Test names describe what they test
4. **Comprehensive Coverage**: Both happy paths and error cases
5. **Type Safety**: Full TypeScript support in tests

## Adding New Tests

When adding new features:

1. Create a corresponding test file in the appropriate `__tests__` directory
2. Mock external dependencies
3. Test both success and failure cases
4. Ensure tests are isolated and repeatable
5. Update this documentation

## Common Testing Patterns

### Testing Async Operations
```typescript
it('should handle async operation', async () => {
  mockFunction.mockResolvedValue(mockData);

  const result = await serviceFunction();

  expect(result).toEqual(expectedData);
});
```

### Testing Component Rendering
```typescript
it('should render component', () => {
  render(<Component />);

  expect(screen.getByText('Expected Text')).toBeTruthy();
});
```

### Testing User Interactions
```typescript
it('should handle user action', () => {
  render(<Component />);

  const button = screen.getByText('Click Me');
  fireEvent.press(button);

  expect(mockCallback).toHaveBeenCalled();
});
```

## Troubleshooting

### Tests Not Running
- Ensure all dependencies are installed: `npm install`
- Clear Jest cache: `npm test -- --clearCache`

### Mock Issues
- Verify mocks are defined before imports
- Check jest.setup.js for global mocks

### Type Errors
- Ensure @types packages are installed
- Check tsconfig.json configuration

## Future Improvements

- [ ] Add E2E tests with Detox
- [ ] Increase coverage to 90%+
- [ ] Add performance tests
- [ ] Add accessibility tests
- [ ] Add snapshot tests for UI components
