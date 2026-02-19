const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://reqres.in/api";
const PROJECT_ID = Number(process.env.NEXT_PUBLIC_PROJECT_ID ?? "3664");

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

interface ApiRecord {
  id: string;
  data: Omit<Chat, "id"> & { type?: string };
}

interface ApiResponse {
  data: ApiRecord[];
}

export async function fetchChats(): Promise<Chat[]> {
  const API_KEY = process.env.REQRES_API_KEY;
  if (!API_KEY) throw new Error("Missing required environment variable: REQRES_API_KEY");

  const headers = {
    "x-api-key": API_KEY,
    "X-Reqres-Env": "prod",
    "Content-Type": "application/json",
  };

  const res = await fetch(
    `${BASE_URL}/collections/task/records?project_id=${PROJECT_ID}`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) throw new Error("Failed to fetch chats");
  const json: ApiResponse = await res.json();
  return json.data
    .filter((r) => r.data?.type === "chat")
    .map((r) => ({ id: r.id, ...r.data }));
}
