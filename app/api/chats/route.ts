import { NextResponse } from "next/server";
import { fetchChats } from "@/lib/api";

export async function GET() {
  try {
    const chats = await fetchChats();
    return NextResponse.json(chats);
  } catch {
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
