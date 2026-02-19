"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Clock, Pencil, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Task } from "@/lib/api";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_HEADERS = ["M","T","W","Th","F","S","S"];

function parseDueDate(dateStr: string): Date | null {
  // Expects "d/M/YYYY" or "dd/MM/YYYY"
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const y = parseInt(parts[2], 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  return new Date(y, m, d);
}

function formatDueDate(date: Date): string {
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function DatePicker({
  value,
  onChange,
  onClose,
  anchorRef,
}: {
  value: string;
  onChange: (val: string) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const parsed = parseDueDate(value);
  const now = parsed ?? new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      // calendar is ~260px tall; if less than 280px below, open upward
      setOpenUp(window.innerHeight - rect.bottom < 280);
    }
  }, [anchorRef]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  // Build calendar grid: weeks starting Monday
  const firstDay = new Date(viewYear, viewMonth, 1);
  // getDay(): 0=Sun,1=Mon,...6=Sat → shift so Mon=0
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDay = parsed && parsed.getFullYear() === viewYear && parsed.getMonth() === viewMonth
    ? parsed.getDate()
    : null;

  return (
    <div
      ref={ref}
      onMouseDown={(e) => e.stopPropagation()}
      className="absolute z-20 bg-white rounded-lg shadow-xl border border-[#BDBDBD] p-4 w-[260px]"
      style={openUp ? { bottom: "calc(100% + 8px)", left: 0 } : { top: "calc(100% + 8px)", left: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
          <ChevronLeft size={16} className="text-[#333333]" />
        </button>
        <span className="text-sm font-semibold text-[#333333]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="p-1 hover:bg-[#F5F5F5] rounded transition-colors">
          <ChevronRight size={16} className="text-[#333333]" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-[#828282] py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, idx) => (
          <div key={idx} className="flex items-center justify-center py-0.5">
            {day !== null ? (
              <button
                onClick={() => {
                  onChange(formatDueDate(new Date(viewYear, viewMonth, day)));
                  onClose();
                }}
                className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${
                  day === selectedDay
                    ? "bg-[#2F80ED] text-white"
                    : "text-[#333333] hover:bg-[#F5F5F5]"
                }`}
              >
                {day}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function TaskMenu({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-6 z-10 bg-white rounded-lg shadow-lg border border-[#BDBDBD] w-[126px] overflow-hidden"
    >
      <button className="w-full px-4 py-3 text-left text-sm text-[#EB5757] font-semibold hover:bg-[#F5F5F5] transition-colors">
        Delete
      </button>
    </div>
  );
}

function NewTaskForm({ onSave, onCancel }: { onSave: (task: Task) => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [desc, setDesc] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef(title);
  const dueDateRef = useRef(dueDate);
  const descRef = useRef(desc);

  titleRef.current = title;
  dueDateRef.current = dueDate;
  descRef.current = desc;

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const datePickerOpenRef = useRef(false);
  datePickerOpenRef.current = datePickerOpen;
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (datePickerOpenRef.current) return;
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        if (titleRef.current.trim()) {
          onSave({
            id: crypto.randomUUID(),
            title: titleRef.current.trim(),
            dueDate: dueDateRef.current || "",
            daysLeft: null,
            description: descRef.current,
            completed: false,
          });
        } else {
          onCancel();
        }
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onSave, onCancel]);

  function handleSave() {
    if (!title.trim()) return;
    onSave({
      id: crypto.randomUUID(),
      title: title.trim(),
      dueDate: dueDate || "",
      daysLeft: null,
      description: desc,
      completed: false,
    });
  }

  return (
    <div ref={formRef} className="border-b border-[#BDBDBD]">
      <div className="flex items-start gap-3 px-5 py-4">
        <div className="mt-0.5 w-4 h-4 rounded shrink-0 border border-[#333333] bg-white" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
              placeholder="Type Task Title"
              className="flex-1 border border-[#BDBDBD] rounded px-3 py-1.5 text-sm text-[#333333] outline-none focus:border-[#2F80ED] transition-colors font-bold"
            />
            <div className="flex items-center gap-2 shrink-0 mt-1">
              <button onClick={onCancel} className="text-[#333333] hover:opacity-70">
                <ChevronUp size={14} />
              </button>
              <div className="w-[14px]" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 pb-4 space-y-3 ml-7">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-[#828282] shrink-0" />
          <div className="relative">
            <button
              ref={dateButtonRef}
              onClick={() => {
                setDatePickerOpen((v) => !v);
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                }, 50);
              }}
              className="flex items-center border border-[#BDBDBD] rounded px-3 py-1.5 gap-2 text-sm text-[#828282] hover:bg-[#F5F5F5] transition-colors"
            >
              <span>{dueDate || "Set Date"}</span>
              <Calendar size={14} className="text-[#828282]" />
            </button>
            {datePickerOpen && (
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                onClose={() => setDatePickerOpen(false)}
                anchorRef={dateButtonRef}
              />
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Pencil size={16} className="text-[#828282] shrink-0 mt-0.5" />
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="No Description"
            className="flex-1 text-sm text-[#333333] outline-none border-b border-transparent focus:border-[#BDBDBD] transition-colors bg-transparent pb-0.5"
          />
        </div>
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
}: {
  task: Task & { expanded: boolean };
  onToggle: (id: string) => void;
}) {
  const [checked, setChecked] = useState(task.completed);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [desc, setDesc] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  function handlePencilClick() {
    setEditingDesc(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return (
    <div className="border-b border-[#BDBDBD] last:border-b-0">
      <div className="flex items-start gap-3 px-5 py-4">
        <button
          onClick={() => setChecked((v) => !v)}
          className={`mt-0.5 w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors ${
            checked
              ? "bg-white border-[#828282]"
              : "bg-white border-[#333333]"
          }`}
        >
          {checked && (
            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#828282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span
              className={`text-sm font-bold leading-snug flex-1 ${
                checked ? "line-through text-[#828282]" : "text-[#333333]"
              }`}
            >
              {task.title}
            </span>
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              {!checked && task.daysLeft !== null && (
                <span className="text-xs text-[#EB5757] font-semibold whitespace-nowrap">
                  {task.daysLeft} Days Left
                </span>
              )}
              <span className="text-xs text-[#333333] whitespace-nowrap">{dueDate}</span>
              <button onClick={() => onToggle(task.id)} className="text-[#333333] hover:opacity-70">
                {task.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="text-[#333333] hover:opacity-70"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen && <TaskMenu onClose={() => setMenuOpen(false)} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {task.expanded && (
        <div className="px-5 pb-4 space-y-3 ml-7">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-[#2F80ED] shrink-0" />
            <div className="relative">
              <button
                ref={dateButtonRef}
                onClick={() => setDatePickerOpen((v) => !v)}
                className="flex items-center border border-[#BDBDBD] rounded px-3 py-1.5 gap-2 text-sm text-[#333333] hover:bg-[#F5F5F5] transition-colors"
              >
                <span>{dueDate}</span>
                <Calendar size={14} className="text-[#333333]" />
              </button>
              {datePickerOpen && (
                <DatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  onClose={() => setDatePickerOpen(false)}
                  anchorRef={dateButtonRef}
                />
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <button
              onClick={handlePencilClick}
              className="mt-0.5 shrink-0 hover:opacity-70 transition-opacity"
            >
              <Pencil
                size={16}
                className={desc ? "text-[#2F80ED]" : "text-[#828282]"}
              />
            </button>
            {editingDesc ? (
              <textarea
                ref={textareaRef}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                onBlur={() => setEditingDesc(false)}
                rows={3}
                className="flex-1 border border-[#BDBDBD] rounded px-3 py-2 text-sm text-[#333333] outline-none focus:border-[#2F80ED] transition-colors resize-none"
                placeholder="No Description"
              />
            ) : (
              <span
                className="text-sm text-[#333333] cursor-text"
                onClick={handlePencilClick}
              >
                {desc || "No Description"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const TASK_CATEGORIES = ["My Tasks", "Personal Errands", "Urgent To-Do"];

type TaskEntry = Task & { expanded: boolean };

export default function TaskPanel() {
  const [tasks, setTasks] = useState<TaskEntry[]>([]);
  const [newTasks, setNewTasks] = useState<TaskEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [category, setCategory] = useState("My Tasks");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: Task[]) =>
        setTasks(
          data.map((t) => ({
            ...t,
            expanded: !t.completed,
          }))
        )
      )
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t))
    );
    setNewTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t))
    );
  }

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className="w-[734px] h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between shrink-0">
        <div ref={categoryRef} className="relative">
          <button
            onClick={() => setCategoryOpen((v) => !v)}
            className="flex items-center gap-2 border border-[#333333] rounded px-3 py-1.5 text-sm font-semibold text-[#333333] hover:bg-[#F5F5F5] transition-colors"
          >
            {category}
            <ChevronDown size={14} />
          </button>
          {categoryOpen && (
            <div className="absolute left-0 top-[calc(100%+4px)] z-20 bg-white rounded-lg shadow-lg border border-[#BDBDBD] w-[180px] overflow-hidden">
              {TASK_CATEGORIES.filter((c) => c !== category).map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategory(c); setCategoryOpen(false); }}
                  className="w-full px-4 py-3 text-left text-sm text-[#333333] font-semibold hover:bg-[#F5F5F5] transition-colors border-b border-[#BDBDBD] last:border-b-0"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setAddingTask(true)}
          className="bg-[#2F80ED] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#2567c4] transition-colors"
        >
          New Task
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[#828282]">
            <div className="w-8 h-8 border-2 border-[#C4C4C4] border-t-[#828282] rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading Task List ...</span>
          </div>
        ) : (
          <>
            {sorted.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={toggleExpand} />
            ))}
            {newTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={toggleExpand} />
            ))}
            {addingTask && (
              <NewTaskForm
                onSave={(newTask) => {
                  setNewTasks((prev) => [...prev, { ...newTask, expanded: true }]);
                  setAddingTask(false);
                }}
                onCancel={() => setAddingTask(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
