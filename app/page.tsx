import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import FAB from "@/components/FAB";

export default function Home() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#2F2F2F]">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 bg-[#3D3D3D] relative" />
      </div>
      <FAB />
    </div>
  );
}
