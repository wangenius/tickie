---
title: Getting Started
order: 1
---

# Tickie

Tickie is a simple and powerful cron task scheduling system, supports using cron expressions to define task execution time. It provides flexible task management, status monitoring, and error handling mechanisms.

## Installation

```bash
npm install tickie
```

## Quick Start

### 1. Create a task

Creating a new cron task is very simple:

```typescript
import { Tickie } from "tickie";

// Create a new task
const task = new Tickie({
  // The data related to the task
  data: {
    name: "Daily Backup",
    description: "Database daily backup task",
  },
});

// Set cron expression
task.cron("0 0 * * *"); // Execute at midnight every day

// Set the execution function
task.exe(async () => {
  try {
    // Execute the task logic
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
task.set({ data: { name: "New task name" } });
```

## Cron Expression

Tickie uses standard cron expressions to define task execution time. Here are some common examples:

```typescript
// Execute at midnight every day
"0 0 * * *";

// Execute at midnight every Monday
"0 0 * * 1";

// Execute at midnight on the 1st day of every month
"0 0 1 * *";

// Execute every hour
"0 * * * *";

// Execute every 5 minutes
"*/5 * * * *";
```

## Task Status

Each task has the following status:

- `pending`: Waiting to execute
- `running`: Running
- `completed`: Completed
- `failed`: Failed

You can get the task status using the `use()` method, more use reference: [Echo](https://wangenius.github.io/echo-state/):

```typescript
const task = new Tickie({ data: {} });
task.cron("0 0 * * *");

// Get all properties
const props = task.use();
console.log(`Task status: ${props.status}`);
console.log(`Last execution time: ${props.lastRunTime}`);
console.log(`Next execution time: ${props.nextRunTime}`);
```

## Error Handling

When the task execution fails, the error information will be automatically recorded:

```typescript
const task = new Tickie({ data: {} });
task.cron("0 0 * * *");

task.exe(async () => {
  try {
    // Possible failed operation
    await someOperation();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

// Check task status
const props = task.use();
if (props.status === "failed") {
  console.error(`Task execution failed: ${props.error}`);
}
```

## Best Practices

1. The task ID should be descriptive for easier identification and management
2. Use try-catch to handle errors in the task execution process
3. Regularly check task status and error information
4. Stop all tasks when the application is closed
5. Set the cron expression reasonably to avoid excessive execution

## Notes

1. The task executor must be an asynchronous function
2. The task executor must return the `TickieResult` type of result
3. The cron expression must conform to the standard format
4. It is recommended to use a shorter execution interval for testing in the development environment
5. Pay attention to handling time zone issues, the cron expression will use the system local time zone

## Example

### Complete application example

```typescript
import { Tickie } from "tickie";

// Create a database backup task
const backupTask = new Tickie({
  data: {
    name: "Database Backup",
    type: "backup",
  },
});

backupTask
  .cron("0 0 * * *") // Execute at midnight every day
  .exe(async () => {
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

// Create a report generation task
const reportTask = new Tickie({
  data: {
    name: "Weekly Report Generation",
    type: "report",
  },
});

reportTask
  .cron("0 0 * * 1") // Execute at midnight every Monday
  .exe(async () => {
    try {
      await generateReport();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

// Start all tasks
await Promise.all([backupTask.start(), reportTask.start()]);
```
