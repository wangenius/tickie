import React, { useState, useEffect } from "react";
import { Tickie } from "../src/Tickie";

// 主应用组件
export function App() {
  const [newTaskId, setNewTaskId] = useState("");
  const [newTaskCron, setNewTaskCron] = useState("* * * * * *");
  const [tasks, setTasks] = useState<Tickie[]>([]);

  // 创建新任务
  const handleCreateTask = async () => {
    if (!newTaskId || !newTaskCron) {
      alert("创建任务失败：参数不完整");
      return;
    }

    try {
      const tickie = new Tickie({ id: newTaskId });
      tickie.cron(newTaskCron).exe(async () => {
        const now = new Date().toLocaleString();
        // 模拟任务执行
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return {
          success: true,
          time: now,
          message: `任务 ${newTaskId} 执行完成`,
        };
      });

      await tickie.start();
      setTasks([...tasks, tickie]);

      setNewTaskId("");
      setNewTaskCron("* * * * * *");
    } catch (error) {
      alert(`创建任务失败: ${error}`);
    }
  };

  // 停止任务
  const handleStopTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await task.stop();
      setTasks([...tasks]);
    }
  };

  // 启动任务
  const handleStartTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await task.start();
      setTasks([...tasks]);
    }
  };

  // 删除任务
  const handleDeleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await task.stop();
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
      <h1
        style={{
          textAlign: "center",
          color: "#1e40af",
          fontSize: "2rem",
          marginBottom: "2rem",
        }}
      >
        Tickie 定时任务测试
      </h1>

      {/* 创建新任务表单 */}
      <div
        style={{
          background: "#f8fafc",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        <h2 style={{ marginBottom: "1rem", color: "#1e40af" }}>创建新任务</h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            type="text"
            value={newTaskId}
            onChange={(e) => setNewTaskId(e.target.value)}
            placeholder="任务ID"
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid #e2e8f0",
              flex: 1,
            }}
          />
          <input
            type="text"
            value={newTaskCron}
            onChange={(e) => setNewTaskCron(e.target.value)}
            placeholder="Cron表达式 (例如: 0 * * * *)"
            style={{
              padding: "0.5rem",
              borderRadius: "0.25rem",
              border: "1px solid #e2e8f0",
              flex: 2,
            }}
          />
          <button
            onClick={handleCreateTask}
            style={{
              padding: "0.5rem 1rem",
              background: "#1e40af",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
          >
            创建任务
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <div>
        <h2 style={{ marginBottom: "1rem", color: "#1e40af" }}>任务列表</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              handleStopTask={handleStopTask}
              handleStartTask={handleStartTask}
              handleDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </div>

      {/* 页脚 */}
      <footer
        style={{
          marginTop: "3rem",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "0.875rem",
          padding: "1rem",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        Tickie 定时任务管理系统
      </footer>
    </div>
  );
}

export const TaskItem = ({
  task,
  handleStopTask,
  handleStartTask,
  handleDeleteTask,
}: {
  task: Tickie;
  handleStopTask: (id: string) => void;
  handleStartTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
}) => {
  const { nextRunTime, lastRunTime, status, cron } = task.use();
  return (
    <div
      key={task.id}
      style={{
        background: "white",
        padding: "1rem",
        borderRadius: "0.5rem",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#1e40af" }}>
            {task.id}
          </h3>
          <p style={{ margin: "0", color: "#64748b" }}>Cron: {cron}</p>
          <p style={{ margin: "0.5rem 0 0 0", color: "#64748b" }}>
            状态: {status}
          </p>
          {lastRunTime && (
            <p style={{ margin: "0.5rem 0 0 0", color: "#64748b" }}>
              上次执行: {new Date(lastRunTime).toLocaleString()}
            </p>
          )}
          {nextRunTime && (
            <p style={{ margin: "0.5rem 0 0 0", color: "#64748b" }}>
              下次执行: {new Date(nextRunTime).toLocaleString()}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {status === "running" ? (
            <button
              onClick={() => handleStopTask(task.id)}
              style={{
                padding: "0.5rem 1rem",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
              }}
            >
              停止
            </button>
          ) : (
            <button
              onClick={() => handleStartTask(task.id)}
              style={{
                padding: "0.5rem 1rem",
                background: "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
              }}
            >
              启动
            </button>
          )}
          <button
            onClick={() => handleDeleteTask(task.id)}
            style={{
              padding: "0.5rem 1rem",
              background: "#64748b",
              color: "white",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};
