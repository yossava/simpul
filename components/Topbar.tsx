import { Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="h-[58px] bg-[#4F4F4F] flex items-center px-4 shrink-0">
      <div className="relative w-full max-w-sm">
        <Search
          size={16}
          strokeWidth={2}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#828282] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search"
          className="w-full h-[34px] bg-transparent border-none pl-9 pr-3 text-sm text-white placeholder-[#828282] outline-none"
        />
      </div>
    </header>
  );
}
