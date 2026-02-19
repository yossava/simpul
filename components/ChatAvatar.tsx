export function getAvatarColor(title: string) {
  const COLORS = [
    "bg-[#2F80ED]",
    "bg-[#9B51E0]",
    "bg-[#27AE60]",
    "bg-[#F2994A]",
    "bg-[#EB5757]",
    "bg-[#56CCF2]",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function PersonIconOutlined({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function ChatAvatar({ title }: { title: string }) {
  return (
    <div className="relative w-[52px] h-[34px] shrink-0">
      <div className="absolute left-0 top-0 w-[34px] h-[34px] bg-[#E0E0E0] rounded-full flex items-center justify-center">
        <PersonIconOutlined color="#4F4F4F" />
      </div>
      <div className="absolute left-[18px] top-0 w-[34px] h-[34px] bg-[#2F80ED] rounded-full flex items-center justify-center">
        <PersonIconOutlined color="white" />
      </div>
    </div>
  );
}

export function LetterAvatar({ letter, title }: { letter: string; title: string }) {
  const color = getAvatarColor(title);
  return (
    <div className={`w-[42px] h-[42px] ${color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {letter}
    </div>
  );
}
