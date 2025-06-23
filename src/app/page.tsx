import { ChatPanel } from '@/components/chat/chat-panel';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <ChatPanel />
    </main>
  );
}
