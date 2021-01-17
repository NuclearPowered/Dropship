export interface BackgroundTask {
  uuid: string;
  name: string;
  state: TaskState;
  currentProgress: number;
  totalProgress: number;
}

export interface TaskUpdate {
  uuid: string;
  state: TaskState;
  currentProgress: number;
}

export enum TaskState {
  None,
  Created, // Task is created. If task is stopped after running, it is TaskState.Stopped, not TaskState.Created
  Running,
  Stopped,
  Success,
  Error,
}
