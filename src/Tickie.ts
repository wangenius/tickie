import { CronExpressionParser } from "cron-parser";
import { Echo } from "echo-state";
import { Generator } from "./gen";

/* 任务执行结果类型 */
export interface TickieResult {
  success: boolean;
  error?: string;
  data?: any;
}

/* 任务执行函数类型 */
export type TickieExecutorFn = () => Promise<TickieResult>;

/* 任务状态类型 */
export type TickieStatus = "pending" | "running" | "completed" | "failed";

/* 任务属性接口 */
export interface TickieProps {
  id: string;
  enabled: boolean;
  data: any;
  cron: string;
  timer?: NodeJS.Timeout;
  lastRunTime?: string;
  nextRunTime?: string;
  status: TickieStatus;
  error?: string;
}

export class Tickie {
  private store: Echo<TickieProps> = new Echo<TickieProps>({
    id: "",
    data: {},
    enabled: false,
    cron: "",
    timer: undefined,
    lastRunTime: "",
    nextRunTime: "",
    status: "pending",
    error: "",
  });
  private executor: TickieExecutorFn;
  use = this.store.use.bind(this.store);
  set = this.store.set.bind(this.store);
  constructor(data: any) {
    const id = Generator.id();
    this.store.set({ id, data });
    this.executor = async () => ({ success: true });
  }

  get id() {
    return this.store.current["id"];
  }

  /* 设置 cron 表达式 */
  cron(expression: string): this {
    try {
      CronExpressionParser.parse(expression);
      this.store.set({ cron: expression });
    } catch (error) {
      throw new Error(
        `无效的 cron 表达式: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    return this;
  }

  /* 设置执行函数 */
  exe(fn: TickieExecutorFn): this {
    this.executor = fn;
    return this;
  }

  /* 启动任务 */
  async start(): Promise<void> {
    if (this.store.current["cron"] === "") {
      throw new Error("no cron expression");
    }

    if (this.store.current["enabled"]) {
      console.log(
        `[${new Date().toLocaleString()}] 任务[${
          this.store.current["id"]
        }]已经在运行中`
      );
      return;
    }

    console.log(
      `[${new Date().toLocaleString()}] 正在启动任务[${
        this.store.current["id"]
      }]`
    );
    this.store.set({ enabled: true, status: "pending" });

    await this.scheduleNextRun(this.store.current["cron"]);

    console.log(
      `[${new Date().toLocaleString()}] 任务[${
        this.store.current["id"]
      }]启动成功`
    );
  }

  /* 停止任务 */
  async stop(): Promise<void> {
    if (!this.store.current["enabled"]) {
      return;
    }
    this.store.set({ enabled: false, status: "pending" });
    this.clearTimers();
  }

  private clearTimers(): void {
    if (this.store.current["timer"]) {
      clearTimeout(this.store.current["timer"]);
    }
    this.store.set({ timer: undefined });
  }

  calculateNextRun(cronExpression: string): Date {
    try {
      const interval = CronExpressionParser.parse(cronExpression, {
        currentDate: new Date(),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      return interval.next().toDate();
    } catch (error) {
      throw new Error(
        `无效的 cron 表达式: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async scheduleNextRun(cronExpr: string): Promise<void> {
    if (!this.store.current["enabled"]) {
      console.log(
        `[${new Date().toLocaleString()}] 任务[${
          this.store.current["id"]
        }]已禁用，不进行调度`
      );
      return;
    }

    try {
      const nextRun = this.calculateNextRun(cronExpr);
      const now = new Date();
      const delay = nextRun.getTime() - now.getTime();

      this.store.set({
        nextRunTime: nextRun.toISOString(),
        status: "pending",
      });

      console.log(
        `[${now.toLocaleString()}] 任务[${
          this.store.current["id"]
        }]下次执行时间: ${nextRun.toLocaleString()}`
      );

      if (delay <= 0) {
        console.log(
          `[${now.toLocaleString()}] 任务[${this.store.current["id"]}]立即执行`
        );
        await this.run();
        await this.scheduleNextRun(cronExpr);
        return;
      }

      if (this.store.current["timer"]) {
        clearTimeout(this.store.current["timer"]);
      }

      const timer = setTimeout(async () => {
        if (!this.store.current["enabled"]) {
          console.log(
            `[${new Date().toLocaleString()}] 任务[${
              this.store.current["id"]
            }]已禁用，取消执行`
          );
          return;
        }
        await this.run();
        await this.scheduleNextRun(cronExpr);
      }, delay);

      this.store.set({ timer });
      console.log(
        `[${now.toLocaleString()}] 任务[${
          this.store.current["id"]
        }]定时器设置成功，将在 ${delay}ms 后执行`
      );
    } catch (error) {
      this.store.set({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      console.error(
        `[${new Date().toLocaleString()}] 为任务[${
          this.store.current["id"]
        }]创建定时器失败:`,
        error
      );
    }
  }

  /* 执行任务 */
  private async run(): Promise<void> {
    if (!this.store.current["enabled"]) return;
    try {
      this.store.set({
        status: "running",
        lastRunTime: new Date().toLocaleString(),
      });
      /* 执行任务 */
      const result = await this.executor();
      if (!result.success) {
        throw new Error(result.error || "执行失败");
      }
      this.store.set({ status: "completed", error: undefined });
    } catch (error) {
      console.error(
        `[${new Date().toLocaleString()}] 任务[${
          this.store.current["id"]
        }]执行失败:`,
        error
      );
      this.store.set({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
