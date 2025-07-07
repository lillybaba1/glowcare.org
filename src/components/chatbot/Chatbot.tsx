
"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, Sparkles, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { skincareChatbot } from "@/ai/flows/skincare-chatbot";
import type { Product } from '@/lib/types';
import { useAuth } from "@/hooks/use-auth";

interface Message {
  role: "user" | "bot";
  content: string;
}

type ProductContext = Pick<Product, 'name' | 'description'> | null;

export default function Chatbot({ productContext }: { productContext: ProductContext }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { response } = await skincareChatbot({ 
        history: newMessages,
        productContext: productContext || undefined,
        isAdmin,
      });
      const botMessage: Message = { role: "bot", content: response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      const errorContent = error?.message || "An unknown error occurred. Please check the server logs.";
      const errorMessage: Message = {
        role: "bot",
        content: `Sorry, I'm having trouble connecting. This is often due to a missing AI service API key in your .env file.\n\nDetails: ${errorContent}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        >
          <Bot className="h-7 w-7" />
          <span className="sr-only">Open Skincare Chatbot</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            GlowCare AI Assistant
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 -mx-6 my-4" ref={scrollAreaRef}>
          <div className="px-6 space-y-6">
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p>
                  Hello! I'm the GlowCare AI assistant. How can I help you with your skincare questions today?
                </p>
              </div>
            </div>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <Avatar>
                  <AvatarFallback>
                    {message.role === "user" ? <User /> : <Bot />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm max-w-[80%] whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                 <Avatar>
                    <AvatarFallback>
                        <Bot />
                    </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm">
                    <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products or advice..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
