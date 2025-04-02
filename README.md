# Tickie

A simple yet powerful task scheduling system for Node.js applications, supporting cron expressions for task timing definition.

[![npm version](https://img.shields.io/npm/v/tickie.svg)](https://www.npmjs.com/package/tickie)
[![license](https://img.shields.io/npm/l/tickie.svg)](https://github.com/yourusername/tickie/blob/main/LICENSE)

## Features

- 🕒 Cron expression support for flexible task scheduling
- 🔄 Automatic task retry and error handling
- 📊 Real-time task status monitoring
- 🎯 TypeScript support
- 🔌 React hooks integration
- 🚀 Lightweight and easy to use

## Installation

```bash
npm install tickie
```

## Quick Start

### 1. Create a Task

```typescript
import { Tickie } from "tickie";

// Create a new task
const task = new Tickie({
  data: {
    name: "Daily Backup",
    description: "Database backup task",
  },
});

// Set cron expression
task.cron("0 0 * * *"); // Run at midnight every day

// Set execution function
task.exe(async () => {
  try {
    await backupDatabase();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// Start the task
await task.start();
```

### 2. Task Management

```typescript
// Get task properties
const props = task.use();

// Stop the task
await task.stop();

// Update task data
task.set({ data: { name: "New Task Name" } });
```

## Task States

Each task can be in one of the following states:

- `pending`: Waiting to be executed
- `running`: Currently executing
- `completed`: Execution completed successfully
- `failed`: Execution failed

## Cron Expressions

Tickie uses standard cron expressions for task scheduling. Here are some common examples:

```typescript
// Every day at midnight
"0 0 * * *";

// Every Monday at midnight
"0 0 * * 1";

// First day of every month at midnight
"0 0 1 * *";

// Every hour
"0 * * * *";

// Every 5 minutes
"*/5 * * * *";
```

## React Integration

Tickie provides React hooks for easy integration with React applications:

```typescript
import { Tickie } from "tickie";

function TaskMonitor() {
  const task = new Tickie({ data: { name: "Monitor Task" } });
  const props = task.use();

  return (
    <div>
      <h2>Task Status</h2>
      <p>Status: {props.status}</p>
      <p>Last Run: {props.lastRunTime}</p>
      <p>Next Run: {props.nextRunTime}</p>
      {props.error && <p>Error: {props.error}</p>}
    </div>
  );
}
```

## API Reference

### Tickie Class

#### Constructor

```typescript
new Tickie(options: { data: any })
```

#### Methods

- `cron(expression: string): this` - Set the cron expression
- `exe(fn: () => Promise<TickieResult>): this` - Set the execution function
- `start(): Promise<void>` - Start the task
- `stop(): Promise<void>` - Stop the task
- `use(): TickieProps` - Get task properties (React hook)
- `set(props: Partial<TickieProps>): void` - Update task properties

### Types

```typescript
interface TickieResult {
  success: boolean;
  error?: string;
  data?: any;
}

interface TickieProps {
  id: string;
  enabled: boolean;
  data: any;
  cron: string;
  timer?: NodeJS.Timeout;
  lastRunTime?: string;
  nextRunTime?: string;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
}
```

## Best Practices

1. Use descriptive task IDs for better management
2. Implement proper error handling in task executors
3. Monitor task status and errors regularly
4. Stop all tasks when the application shuts down
5. Use appropriate cron expressions to avoid too frequent executions
6. Follow React Hooks rules when using the `use` hook

## Notes

1. Task executors must be async functions
2. Task executors must return a `TickieResult` type
3. Cron expressions must follow standard format
4. Use shorter intervals for testing in development
5. Be aware of timezone settings for cron expressions
6. The `use` hook can only be used in React components or other hooks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.
