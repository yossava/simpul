import { NextResponse } from "next/server";
import { fetchChats } from "@/lib/api";

export async function GET() {
  const chats = await fetchChats();
  return NextResponse.json(chats);
}
