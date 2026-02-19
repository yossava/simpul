"use client";

import { useState, useRef, useEffect } from "react";
import { Zap } from "lucide-react";
import InboxPanel from "./InboxPanel";
import TaskPanel from "./TaskPanel";

type Panel = "inbox" | "task" | null;

function TaskIcon({ active }: { active: boolean }) {
  const color = active ? "white" : "#F8B76B";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  const color = active ? "white" : "#8885FF";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function FAB() {
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setActivePanel(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleMainClick() {
    if (activePanel) {
      setActivePanel(null);
      setExpanded(false);
    } else {
      setExpanded((v) => !v);
    }
  }

  function handlePanelToggle(panel: Panel) {
    if (activePanel === panel) {
      setActivePanel(null);
      setExpanded(true);
    } else {
      setActivePanel(panel);
      setExpanded(false);
    }
  }

  const subButtons: { id: Panel; label: string; icon: (active: boolean) => React.ReactNode; activeColor: string }[] = [
    { id: "task",  label: "Task",  icon: (a) => <TaskIcon active={a} />,  activeColor: "#F8B76B" },
    { id: "inbox", label: "Inbox", icon: (a) => <InboxIcon active={a} />, activeColor: "#7B61FF" },
  ];

  return (
    <div ref={containerRef} className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      {activePanel === "task" && (
        <div className="animate-in mb-2">
          <TaskPanel />
        </div>
      )}
      {activePanel === "inbox" && (
        <div className="animate-in mb-2">
          <InboxPanel onClose={() => setActivePanel(null)} />
        </div>
      )}

      <div className="flex items-end gap-3">
        {[...subButtons]
          .sort((a, b) => {
            if (!activePanel) return 0;
            if (a.id === activePanel) return 1;
            if (b.id === activePanel) return -1;
            return 0;
          })
          .map((btn, i) => {
            const isActive = activePanel === btn.id;
            const isVisible = expanded || !!activePanel;

            return (
              <div
                key={btn.id}
                className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-6 pointer-events-none"
                }`}
                style={{ transitionDelay: expanded && !activePanel ? `${(subButtons.length - 1 - i) * 60}ms` : "0ms" }}
              >
                {!isActive && (
                  <span className="text-white text-xs font-medium select-none">
                    {btn.label}
                  </span>
                )}

                {isActive ? (
                  <div className="relative flex items-center justify-center w-[76px] h-[60px]">
                    <div className="absolute left-0 w-[60px] h-[60px] rounded-full bg-[#2a2a2a]" />
                    <button
                      onClick={() => handlePanelToggle(btn.id)}
                      className="absolute right-0 w-[60px] h-[60px] rounded-full shadow-xl flex items-center justify-center"
                      style={{ backgroundColor: btn.activeColor }}
                    >
                      {btn.icon(true)}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handlePanelToggle(btn.id)}
                    className="w-[52px] h-[52px] rounded-full shadow-lg bg-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95"
                  >
                    {btn.icon(false)}
                  </button>
                )}
              </div>
            );
          })}

        {!activePanel && (
          <button
            onClick={handleMainClick}
            className="w-[60px] h-[60px] rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 bg-[#2F80ED] hover:bg-[#2567c4]"
          >
            <Zap
              size={26}
              className={`transition-transform duration-300 ${expanded ? "rotate-90" : "rotate-0"}`}
              fill="white"
              stroke="none"
            />
          </button>
        )}
      </div>
    </div>
  );
}
