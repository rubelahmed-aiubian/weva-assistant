import ChatWidget from "@/components/ChatWidget";
export default function Home() {
  return (
    <div>
      <div className="flex items-center justify-center text-red-400 font-bold h-screen">
        <h3>Weva Assistant 1.0</h3>
        <ChatWidget />
      </div>
    </div>
  );
}
