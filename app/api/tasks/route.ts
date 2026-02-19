import { NextResponse } from "next/server";
import { fetchTasks, Task } from "@/lib/api";

const FALLBACK_TASKS: Task[] = [
  {
    id: "t1",
    title: "Close off Case #012920- RODRIGUES, Amiguel",
    dueDate: "12/06/2021",
    daysLeft: 2,
    description:
      "Closing off this case since this application has been cancelled. No one really understand how this case could possibly be cancelled. The options and the documents within this document were totally a guaranteed for a success!",
    completed: false,
  },
  {
    id: "t2",
    title:
      "Set up documentation report for several Cases : Case 145443, Case 192829 and Case 182203",
    dueDate: "14/06/2021",
    daysLeft: 4,
    description:
      "All Cases must include all payment transactions, all documents and forms filled. All conversations in comments and messages in channels and emails should be provided as well in.",
    completed: false,
  },
  {
    id: "t3",
    title: "Set up appointment with Dr Blake",
    dueDate: "22/06/2021",
    daysLeft: 10,
    description: "",
    completed: false,
  },
  {
    id: "t4",
    title: "Contact Mr Caleb - video conference?",
    dueDate: "3/06/2021",
    daysLeft: null,
    description: "",
    completed: true,
  },
  {
    id: "t5",
    title: "Assign 3 homework to Client A",
    dueDate: "2/06/2021",
    daysLeft: null,
    description: "",
    completed: true,
  },
];

export async function GET() {
  try {
    const tasks = await fetchTasks();
    return NextResponse.json(tasks.length > 0 ? tasks : FALLBACK_TASKS);
  } catch {
    return NextResponse.json(FALLBACK_TASKS);
  }
}
