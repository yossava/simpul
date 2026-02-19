"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, Clock, Pencil, Calendar, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { Task } from "@/lib/api";

const LABELS: {
  name: string;
  base: string;
  selected: string;
}[] = [
  { name: "Important ASAP",  base: "bg-[#DDEEFF] text-[#333333]",  selected: "border-2 border-[#2F80ED]" },
  { name: "Offline Meeting", base: "bg-[#FDEBD0] text-[#333333]",  selected: "border-2 border-[#E5A443]" },
  { name: "Virtual Meeting", base: "bg-[#FEF9C3] text-[#333333]",  selected: "border-2 border-[#F2C94C]" },
  { name: "ASAP",            base: "bg-[#D5F5E3] text-[#333333]",  selected: "border-2 border-[#27AE60]" },
  { name: "Client Related",  base: "bg-[#D5F5E3] text-[#333333]",  selected: "border-2 border-[#6FCF97]" },
  { name: "Self Task",       base: "bg-[#E8DAFF] text-[#333333]",  selected: "border-2 border-[#9B51E0]" },
  { name: "Appointments",    base: "bg-[#FFD6E0] text-[#333333]",  selected: "border-2 border-[#EB5757]" },
  { name: "Court Related",   base: "bg-[#D6EEF8] text-[#333333]",  selected: "border-2 border-[#56CCF2]" },
];

function LabelPicker({
  selected,
  onChange,
  onClose,
  anchorRef,
}: {
  selected: string[];
  onChange: (labels: string[]) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 220);
    }
  }, [anchorRef]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((l) => l !== name));
    } else {
      onChange([...selected, name]);
    }
  }

  return (
    <div
      ref={ref}
      className="absolute left-0 z-20 bg-white rounded-lg shadow-xl border border-[#BDBDBD] w-[180px] py-1"
      style={openUp ? { bottom: "calc(100% + 4px)" } : { top: "calc(100% + 4px)" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {LABELS.map((label) => {
        const isSelected = selected.includes(label.name);
        return (
          <button
            key={label.name}
            onClick={() => toggle(label.name)}
            className="w-full px-2 py-0.5 text-left"
          >
            <span
              className={`inline-block w-full px-3 py-1 rounded text-xs font-semibold ${label.base} ${isSelected ? label.selected : "border border-transparent"}`}
            >
              {label.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LabelRow({
  labels,
  pickerOpen,
  onTogglePicker,
  onClosePicker,
  onChangeLabels,
}: {
  labels: string[];
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onChangeLabels: (next: string[]) => void;
}) {
  const bookmarkRef = useRef<HTMLButtonElement>(null);
  return (
    <div className="flex items-center gap-3 bg-[#F9F9F9] rounded-lg px-3 py-2">
      <div className="relative shrink-0">
        <button ref={bookmarkRef} onClick={onTogglePicker} className="hover:opacity-70 transition-opacity">
          <Bookmark
            size={16}
            className={labels.length > 0 ? "text-[#2F80ED]" : "text-[#828282]"}
          />
        </button>
        {pickerOpen && (
          <LabelPicker
            selected={labels}
            onChange={onChangeLabels}
            onClose={onClosePicker}
            anchorRef={bookmarkRef}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {labels.length === 0 ? (
          <button onClick={onTogglePicker} className="text-sm text-[#828282]">
            No Label
          </button>
        ) : (
          labels.map((l) => {
            const def = LABELS.find((x) => x.name === l);
            return (
              <span
                key={l}
                className={`px-2 py-0.5 rounded text-xs font-semibold ${def?.base ?? "bg-[#F2F2F2] text-[#333333]"}`}
              >
                {l}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_HEADERS = ["M","T","W","Th","F","S","S"];

function parseDueDate(dateStr: string): Date | null {
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

  const firstDay = new Date(viewYear, viewMonth, 1);
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

function TaskMenu({ onDelete, onClose }: { onDelete: () => void; onClose: () => void }) {
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
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full px-4 py-3 text-left text-sm text-[#EB5757] font-semibold hover:bg-[#F5F5F5] transition-colors"
      >
        Delete
      </button>
    </div>
  );
}

function NewTaskForm({ onSave, onCancel, onSaveRef, excludeRef }: { onSave: (task: Task) => void; onCancel: () => void; onSaveRef?: React.MutableRefObject<(() => void) | null>; excludeRef?: React.RefObject<HTMLElement | null> }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [desc, setDesc] = useState("");
  const [labels, setLabels] = useState<string[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [labelPickerOpen, setLabelPickerOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef(title);
  const dueDateRef = useRef(dueDate);
  const descRef = useRef(desc);
  const labelsRef = useRef(labels);

  titleRef.current = title;
  dueDateRef.current = dueDate;
  descRef.current = desc;
  labelsRef.current = labels;

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const datePickerOpenRef = useRef(false);
  datePickerOpenRef.current = datePickerOpen;
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (datePickerOpenRef.current) return;
      if (excludeRef?.current?.contains(e.target as Node)) return;
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        if (titleRef.current.trim()) {
          onSave({
            id: crypto.randomUUID(),
            title: titleRef.current.trim(),
            dueDate: dueDateRef.current || "",
            daysLeft: null,
            description: descRef.current,
            completed: false,
            labels: labelsRef.current,
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
      labels,
    });
  }

  if (onSaveRef) onSaveRef.current = handleSave;

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

        <LabelRow
          labels={labels}
          pickerOpen={labelPickerOpen}
          onTogglePicker={() => setLabelPickerOpen((v) => !v)}
          onClosePicker={() => setLabelPickerOpen(false)}
          onChangeLabels={setLabels}
        />
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
}: {
  task: Task & { expanded: boolean };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Omit<Task, "id">>) => void;
}) {
  const [checked, setChecked] = useState(task.completed);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [desc, setDesc] = useState(task.description);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [labels, setLabels] = useState<string[]>(task.labels ?? []);
  const [labelPickerOpen, setLabelPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);

  function handlePencilClick() {
    setEditingDesc(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleCheckbox() {
    const next = !checked;
    setChecked(next);
    onUpdate(task.id, { completed: next });
  }

  function handleDateChange(val: string) {
    setDueDate(val);
    onUpdate(task.id, { dueDate: val });
  }

  function handleDescBlur() {
    setEditingDesc(false);
    if (desc !== task.description) {
      onUpdate(task.id, { description: desc });
    }
  }

  function handleLabelsChange(next: string[]) {
    setLabels(next);
    onUpdate(task.id, { labels: next });
  }

  const daysLeftLabel = (() => {
    if (checked || !dueDate) return null;
    const parsed = parseDueDate(dueDate);
    if (!parsed) return null;
    const diff = Math.ceil((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? "Overdue" : `${diff} Days Left`;
  })();

  return (
    <div className="border-b border-[#BDBDBD] last:border-b-0">
      <div className="flex items-start gap-3 px-5 py-4">
        <button
          onClick={handleCheckbox}
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
              {daysLeftLabel && (
                <span className="text-xs text-[#EB5757] font-semibold whitespace-nowrap">
                  {daysLeftLabel}
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
                {menuOpen && (
                  <TaskMenu
                    onDelete={() => onDelete(task.id)}
                    onClose={() => setMenuOpen(false)}
                  />
                )}
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
                  onChange={handleDateChange}
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
                onBlur={handleDescBlur}
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

          <LabelRow
            labels={labels}
            pickerOpen={labelPickerOpen}
            onTogglePicker={() => setLabelPickerOpen((v) => !v)}
            onClosePicker={() => setLabelPickerOpen(false)}
            onChangeLabels={handleLabelsChange}
          />
        </div>
      )}
    </div>
  );
}

function NewTaskFormWrapper(props: { onSave: (task: Task) => void; onCancel: () => void; triggerSaveRef?: React.MutableRefObject<(() => void) | null>; excludeRef?: React.RefObject<HTMLElement | null> }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { triggerSaveRef, excludeRef, ...formProps } = props;

  // expose a save trigger to the parent via triggerSaveRef
  const internalSaveRef = useRef<(() => void) | null>(null);
  if (triggerSaveRef) triggerSaveRef.current = () => internalSaveRef.current?.();

  useEffect(() => {
    wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);
  return (
    <div ref={wrapperRef}>
      <NewTaskForm {...formProps} onSaveRef={internalSaveRef} excludeRef={excludeRef} />
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
  const triggerSaveRef = useRef<(() => void) | null>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
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
        setTasks(data.map((t) => ({ ...t, expanded: !t.completed })))
      )
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t)));
    setNewTasks((prev) => prev.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t)));
  }

  function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setNewTasks((prev) => prev.filter((t) => t.id !== id));
    fetch(`/api/tasks/${id}`, { method: "DELETE" }).catch((err) =>
      console.error("Failed to delete task:", err)
    );
  }

  function handleUpdate(id: string, patch: Partial<Omit<Task, "id">>) {
    const applyPatch = (list: TaskEntry[]) => list.map((t) => (t.id === id ? { ...t, ...patch } : t));
    setTasks(applyPatch);
    setNewTasks(applyPatch);

    const source = [...tasks, ...newTasks].find((t) => t.id === id);
    if (source) {
      const { id: _id, expanded: _exp, ...taskData } = { ...source, ...patch } as Task & { expanded: boolean };
      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      }).catch((err) => console.error("Failed to update task:", err));
    }
  }

  async function handleNewTaskSave(newTask: Task) {
    const tempId = newTask.id;
    setNewTasks((prev) => [...prev, { ...newTask, expanded: true }]);
    setAddingTask(false);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.title,
          dueDate: newTask.dueDate,
          daysLeft: newTask.daysLeft,
          description: newTask.description,
          completed: newTask.completed,
          labels: newTask.labels,
        }),
      });
      if (res.ok) {
        const { id: realId } = await res.json();
        setNewTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: realId } : t)));
      }
    } catch {
      // Network failure — the task remains with its client-generated id until the next page load
    }
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
          ref={saveButtonRef}
          onClick={() => {
            if (addingTask) {
              triggerSaveRef.current?.();
            } else {
              setAddingTask(true);
            }
          }}
          className="bg-[#2F80ED] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#2567c4] transition-colors"
        >
          {addingTask ? "Save" : "New Task"}
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
            {[...sorted, ...newTasks].map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleExpand}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
            {addingTask && (
              <NewTaskFormWrapper
                onSave={handleNewTaskSave}
                onCancel={() => setAddingTask(false)}
                triggerSaveRef={triggerSaveRef}
                excludeRef={saveButtonRef}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
