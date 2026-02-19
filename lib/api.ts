const BASE_URL = process.env.API_BASE_URL ?? "https://reqres.in/api";
const PROJECT_ID = Number(process.env.PROJECT_ID ?? "3664");

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isOwn: boolean;
  isNew?: boolean;
  dateLabel?: string;
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

interface ApiRecord {
  id: string;
  data: Record<string, unknown> & { type?: string };
}

interface ApiResponse {
  data: ApiRecord[];
}

function getHeaders() {
  const API_KEY = process.env.REQRES_API_KEY;
  if (!API_KEY) throw new Error("Missing required environment variable: REQRES_API_KEY");
  return {
    "x-api-key": API_KEY,
    "X-Reqres-Env": "prod",
    "Content-Type": "application/json",
  };
}

async function fetchAll(): Promise<ApiRecord[]> {
  const headers = getHeaders();
  const res = await fetch(
    `${BASE_URL}/collections/task/records?project_id=${PROJECT_ID}`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch records");
  const json: ApiResponse = await res.json();
  return json.data;
}

export async function fetchChats(): Promise<Chat[]> {
  const records = await fetchAll();
  return records
    .filter((r) => r.data?.type === "chat")
    .map((r) => ({ id: r.id, ...(r.data as Omit<Chat, "id">) }));
}

export async function fetchTasks(): Promise<Task[]> {
  const records = await fetchAll();
  return records
    .filter((r) => r.data?.type === "task")
    .map((r) => ({ id: r.id, ...(r.data as Omit<Task, "id">) }));
}
