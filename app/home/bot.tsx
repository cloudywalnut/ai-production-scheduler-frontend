"use client";

import Image from "next/image";
import { useEffect, useRef } from "react"; // Understand useEffect, useRef and understand where and why it is used
import { MessagesType } from "../types/types";

type BotProps = {
  botBox: boolean;
  setBotBox: React.Dispatch<React.SetStateAction<boolean>>;
  messages: MessagesType[];
  setMessages: React.Dispatch<React.SetStateAction<MessagesType[]>>;
};

export default function Bot({ botBox, setBotBox, messages, setMessages }: BotProps) {
  
  // Allows to get an Element Reference which we can use - React DOM related
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  // Anything inside useEffect will get run a certain amount of times, when the variable in the array of useEffect changes
  // If nothing than it runs just once when the component is rendered
  useEffect(() => {
    // Using the ref to do something
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Only affects the scrollable parent
  }, [messages]);

  // Make the handler better and allow the parsing of chathistory too
  async function handleMessageSubmit(){
    const  input = document.getElementById("userMessage") as HTMLTextAreaElement
    if (input?.value.trim()) {

      const userMessage = input.value;
      input.value = "";

      // Need to do this way as functional form of setMessages because the state update is asynchronous,
      //  and this ensures you’re always appending to the latest state
      setMessages(prev => [...prev, { fromUser: true, text: userMessage }]);

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: messages.slice(-5),
          userMessage: userMessage, // whatever the user typed
        }),
      });      
      
      const result = await response.json();

      setMessages(prev => [...prev, { fromUser: false, text: result.aiMessage }]);

      const element = document.getElementById("messageDisplay") as HTMLDivElement;
      element.scrollTop = element.scrollHeight;

    }   
  }
  
  return (
    <div
      className={`flex flex-col items-center justify-between fixed bottom-6 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-lg ${
        !botBox ? "hidden" : ""
      }`}
    >
      <div className="flex items-center justify-between bg-linear-to-r from-blue-600 to-blue-400 w-full px-4 py-3 rounded-t-2xl">
        
        <div className="flex items-center gap-3">
          <Image
            src="/bot.png"
            alt="Bot"
            width={40}
            height={40}
            className="rounded-full border-2 border-white"
            priority
          />
          <div>
            <p className="text-white font-semibold text-sm">Ramadan</p>
            <p className="text-blue-100 text-xs">Online</p>
          </div>
        </div>

        <button
          onClick={() => setBotBox(false)}
          className="text-white hover:bg-blue-700 p-1 rounded-full transition-colors duration-200 flex items-center justify-center w-6 h-6"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Messages Display */}
      <div className="flex-1 w-full overflow-y-auto p-3 flex flex-col gap-2" id="messageDisplay">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-xl text-white ${
              msg.fromUser ? "bg-blue-600 self-end" : "bg-blue-400 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>

      {/* Bot Input */}
      <div className="flex justify-between w-full m-3 gap-3">
        <textarea
          name="userMessage"
          id="userMessage"
          className="w-full h-12 border-2 border-blue-600 text-black rounded-2xl focus:outline-none ml-3 p-3 text-base resize-none overflow-hidden"
        ></textarea>
        <button onClick={async () => { await handleMessageSubmit()}}
        className="bg-blue-600 text-white w-20 h-12 rounded-2xl focus:outline-none mr-3 cursor-pointer active:bg-blue-700">
          Send
        </button>
      </div>
    
    </div>
  );
}