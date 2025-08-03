export interface Container {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  name: string;
  image: string;
  url: string;
  status: "RUNNING" | "STOPPED";
}

export interface FunctionCall {
  id: string;
  name: string;
  logs: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
