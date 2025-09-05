"use client"

import { useState, useRef, useEffect, type FormEvent } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Plus, Mic, AudioLines } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: number
  text: string
  sender: "user" | "ai"
}

interface ChatClientViewProps {
  dict: {
    title: string
    inputPlaceholder: string
    initialMessage: string
  }
}

export function ChatClientView({ dict }: ChatClientViewProps) {
  const [messages, setMessages] = useState<Message[]>([{ id: 1, text: dict.initialMessage, sender: "ai" }])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    const header = document.querySelector("header")

    if (!scrollContainer || !header) return

    const handleScroll = () => {
      const isScrolled = scrollContainer.scrollTop > 10
      if (isScrolled) {
        header.classList.add("bg-white/80", "backdrop-blur-lg", "shadow-sm")
        header.classList.remove("bg-transparent", "shadow-none")
      } else {
        header.classList.remove("bg-white/80", "backdrop-blur-lg", "shadow-sm")
        header.classList.add("bg-transparent", "shadow-none")
      }
    }

    handleScroll() // Initial check
    scrollContainer.addEventListener("scroll", handleScroll)

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll)
      // Reset header style when component unmounts to not affect other pages
      header.classList.remove("bg-white/80", "backdrop-blur-lg", "shadow-sm")
      header.classList.add("bg-transparent", "shadow-none")
    }
  }, [])

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() === "") return

    const newUserMessage: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
    }
    setMessages((prev) => [...prev, newUserMessage])
    setInput("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: `This is a simulated response to: "${input}"`,
        sender: "ai",
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <div className="flex-1 relative mt-14">
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto p-4 space-y-4 pb-28">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex items-end gap-2", {
              "justify-end": message.sender === "user",
            })}
          >
            {message.sender === "ai" && (
              <Avatar className="w-8 h-8">
                <AvatarImage src="/ai-robot.png" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2.5 text-sm shadow-md", {
                "bg-blue-500 text-white rounded-br-none": message.sender === "user",
                "bg-white text-gray-800 rounded-bl-none": message.sender === "ai",
              })}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pt-2 pb-4 bg-gradient-to-t from-white/80 to-transparent">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 backdrop-blur-md rounded-full w-12 h-12 flex-shrink-0 shadow-md border border-white/60"
          >
            <Plus className="w-6 h-6 text-gray-700" />
          </Button>
          <form onSubmit={handleSendMessage} className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={dict.inputPlaceholder}
              className="w-full bg-white/80 backdrop-blur-md rounded-full py-3 pl-5 pr-24 text-gray-800 placeholder:text-gray-500 focus:outline-none shadow-md border border-white/60 h-12"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
              <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" type="button">
                <Mic className="w-5 h-5 text-gray-500" />
              </Button>
              <Button type="submit" size="icon" className="rounded-full w-10 h-10 bg-black hover:bg-gray-800">
                <AudioLines className="w-5 h-5 text-white" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
