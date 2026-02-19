import { NextResponse } from "next/server";
import { fetchTasks, createTask, Task } from "@/lib/api";

export async function GET() {
  try {
    const tasks = await fetchTasks();
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body: Omit<Task, "id"> = await req.json();
    const id = await createTask(body);
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
