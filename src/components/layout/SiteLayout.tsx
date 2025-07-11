
'use client';

import { usePathname } from 'next/navigation';
import { useContext } from 'react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import Chatbot from '@/components/chatbot/Chatbot';
import { ChatbotContext } from '@/context/ChatbotProvider';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const chatbotContext = useContext(ChatbotContext);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <Chatbot productContext={chatbotContext?.productContext || null} />
    </div>
  );
}
