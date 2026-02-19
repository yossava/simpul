const JSONBIN_BASE = "https://api.jsonbin.io/v3/b";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
  isNew?: boolean;
  dateLabel?: string;
  replyTo?: { sender: string; text: string };
}

export interface Chat {
  id: string;
  title: string;
  lastSender: string;
  lastMessage: string;
  lastDate: string;
  unread: boolean;
  participantCount: number;
  participants: string[];
  avatarLetter?: string;
  connecting?: boolean;
  messages: ChatMessage[];
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  daysLeft: number | null;
  description: string;
  completed: boolean;
}

function getHeaders() {
  const key = process.env.JSONBIN_API_KEY;
  if (!key) throw new Error("Missing JSONBIN_API_KEY");
  return {
    "Content-Type": "application/json",
    "X-Master-Key": key,
  };
}

async function getBin<T>(binId: string): Promise<T[]> {
  const res = await fetch(`${JSONBIN_BASE}/${binId}/latest`, {
    headers: getHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to read bin ${binId}`);
  const json = await res.json();
  return json.record as T[];
}

async function putBin<T>(binId: string, data: T[]): Promise<void> {
  const res = await fetch(`${JSONBIN_BASE}/${binId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to write bin ${binId}`);
}

export async function fetchTasks(): Promise<Task[]> {
  return getBin<Task>(requireEnv("JSONBIN_TASKS_BIN"));
}

export async function createTask(task: Omit<Task, "id">): Promise<string> {
  const binId = requireEnv("JSONBIN_TASKS_BIN");
  const tasks = await getBin<Task>(binId);
  const newTask: Task = { id: crypto.randomUUID(), ...task };
  await putBin(binId, [...tasks, newTask]);
  return newTask.id;
}

export async function updateTask(id: string, patch: Omit<Task, "id">): Promise<void> {
  const binId = requireEnv("JSONBIN_TASKS_BIN");
  const tasks = await getBin<Task>(binId);
  await putBin(binId, tasks.map((t) => (t.id === id ? { id, ...patch } : t)));
}

export async function deleteTask(id: string): Promise<void> {
  const binId = requireEnv("JSONBIN_TASKS_BIN");
  const tasks = await getBin<Task>(binId);
  await putBin(binId, tasks.filter((t) => t.id !== id));
}

export async function fetchChats(): Promise<Chat[]> {
  return getBin<Chat>(requireEnv("JSONBIN_CHATS_BIN"));
}

export async function updateChat(chatId: string, chat: Omit<Chat, "id">): Promise<void> {
  const binId = requireEnv("JSONBIN_CHATS_BIN");
  const chats = await getBin<Chat>(binId);
  await putBin(binId, chats.map((c) => (c.id === chatId ? { id: chatId, ...chat } : c)));
}
