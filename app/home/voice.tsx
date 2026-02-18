// app/audio-record/page.tsx
"use client";

// useRef is a react hook in which we can change its .current value and it doesnt trigger re render
// this means that even if the value changes the changes wont be like visible in UI as there is no re render
import { useState, useRef } from "react";
import { MessagesType } from "../types/types";


interface VoiceProps {
  messages: MessagesType[];
  setMessages: React.Dispatch<React.SetStateAction<MessagesType[]>>;
}


export default function Voice({setMessages}: VoiceProps) {

  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder; // mediaRecorderRef.current is a referec to the mediaRecorder
    audioChunksRef.current = []; 

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {

      // Revoke the old URL if it exists
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);

      // audio to text conversion API
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      // Sending the audio to the API for being processed
      fetch('https://vodstr.up.railway.app/voice', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [...prev, { fromUser: true, text: data.text }]);
        agentResponse(data.text)
      })
      .catch(console.error);
      
      setAudioURL(url);

    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // Set the Agent Behaviour over here
  const agentResponse = (userMessage: string) => {
    
    fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage }),
    })
    .then(res => res.json())
    .then((data) => {

    setMessages(prev => [...prev, { fromUser: false, text: data.aiMessage }]);
    genVoiceOutput(data.aiMessage)

    })
    .catch(err => console.error(err));

  }

  // Generates the voice output, use either webSpeechAPI or OpenAI
  const genVoiceOutput = (aiMessage: string) => {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(aiMessage);
      const voices = synth.getVoices();

      utterance.voice = voices[1] || voices[0];
      utterance.rate = 1.2;
      utterance.pitch = 1.8;
      utterance.lang = "en-US";
      
      synth.cancel();
      synth.speak(utterance);
  }

  // Set which function the agent calls over here
  const agentActionRouter = (functionName: string) => {

  }

  return (

    <>
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer ${
          recording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {recording ? "Stop Talking" : "Talk to Agent"}
      </button>

      {/* {audioURL && (
        <div className="mt-6">
          <audio autoPlay src={audioURL} />
        </div>
      )} */}
    </>

  );
}
