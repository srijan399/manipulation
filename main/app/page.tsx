"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, User, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
    role: string;
    content: string;
}

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);

    const [userMessage, setUserMessage] = useState<string>("");
    // Reference to the end of the messages container
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleClick = async () => {
        if (!userMessage.trim()) return;

        setIsLoading(true);
        const currentMessage = userMessage;
        console.log("Current message:", currentMessage);
        setUserMessage(""); // Clear input immediately

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: currentMessage }),
            });
            const rawResult = await response.json();

            console.log("Raw Result:", rawResult.data);

            // Update messages with the full conversation history from backend
            setMessages(rawResult.data.messages || []);
        } catch (err) {
            console.error("Error generating content:", err);
            setMessages((prev) => [
                ...prev,
                {
                    role: "system",
                    content:
                        "Sorry, there was an error processing your request.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold">
                    Cricket Content Generator
                </h1>

                {/* Chat Messages Container */}
                <div className="w-full bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border">
                    {messages.length === 0 ? (
                        <div className="text-gray-500 text-center py-8">
                            Start a conversation about cricket!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${
                                        message.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    {message.role !== "user" && (
                                        <div className="flex-shrink-0">
                                            <Bot className="w-6 h-6 text-blue-600" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            message.role === "user"
                                                ? "bg-blue-600 text-white"
                                                : "bg-white border"
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    </div>
                                    {message.role === "user" && (
                                        <div className="flex-shrink-0">
                                            <User className="w-6 h-6 text-gray-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="flex-shrink-0">
                                        <Bot className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="bg-white border rounded-lg px-4 py-2">
                                        <p className="text-sm text-gray-500">
                                            Thinking...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Section */}
                <div className="flex flex-col items-center sm:items-start w-full">
                    <div className="flex flex-col space-y-2 w-full">
                        <Label htmlFor="cricket-content">Your Message:</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="cricket-content"
                                placeholder="Ask me anything about cricket..."
                                value={userMessage}
                                onChange={(e) => setUserMessage(e.target.value)}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleClick}
                                disabled={isLoading || !userMessage.trim()}
                            >
                                <Send className="ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Conversation Stats */}
                {messages.length > 0 && (
                    <div className="text-sm text-gray-500">
                        Conversation: {messages.length} messages
                    </div>
                )}
            </main>
        </div>
    );
}
