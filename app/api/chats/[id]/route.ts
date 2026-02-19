import { NextResponse } from "next/server";
import { updateChat, Chat } from "@/lib/api";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Omit<Chat, "id"> = await req.json();
    await updateChat(id, body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}
