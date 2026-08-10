// app/audio-record/page.tsx
"use client";

// useRef is a react hook in which we can change its .current value and it doesnt trigger re render
// this means that even if the value changes the changes wont be like visible in UI as there is no re render
import { useState, useRef } from "react";
import { AIResponseType, MessagesType, ShootingDay } from "../types/types";
import { authFetch } from "../utils/authFetch";
import { formatScheduleForAI } from "../utils/formatSchedule";
import { applyAgentAction } from "../utils/applyAgentAction";


interface VoiceProps {
  messages: MessagesType[];
  setMessages: React.Dispatch<React.SetStateAction<MessagesType[]>>;
  schedule: ShootingDay[]
  setSchedule: React.Dispatch<React.SetStateAction<ShootingDay[]>>;
}


export default function Voice({messages, setMessages, schedule, setSchedule}: VoiceProps) {

  const [recording, setRecording] = useState(false);
  const [aiTalking, setAiTalking] = useState(false);
  const [processing, setProcessing] = useState(false); // true from "stop recording" until the AI reply starts speaking
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Actions to take when recording starts
  const startRecording = async () => {
    
    // Stops the previous speaking going on when new recording starts
    window.speechSynthesis.cancel();

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
      .catch(err => {
        console.error(err);
        setProcessing(false);
      });

      setAudioURL(url);

    };

    mediaRecorder.start();
    setRecording(true);
  };

  // Action to take when recording stops
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    setProcessing(true); // waiting on transcription + AI reply now
  };

  // To stop ai from speaking
  const stopAISpeaking = () => {
    // Stops the previous speaking going on when new recording starts
    window.speechSynthesis.cancel();
    setAiTalking(false);
  }

  // Set the Agent Behaviour over here
  const agentResponse = (userMessage: string) => {
    
    const formattedSchedule = formatScheduleForAI(schedule);

    authFetch("/api/ai", {
      history: messages.slice(-5),
      userMessage,
      formattedSchedule
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok || !data.aiResponse) {
        setProcessing(false);
        setMessages(prev => [...prev, { fromUser: false, text: "Sorry, something went wrong processing that. Please try again." }]);
        return;
      }

      const aiResponse: AIResponseType = data.aiResponse;
      setMessages(prev => [...prev, { fromUser: false, text: aiResponse.response }]);
      setProcessing(false);
      genVoiceOutput(aiResponse.response)

      const updatedSchedule = applyAgentAction(schedule, aiResponse);
      if (updatedSchedule) setSchedule(updatedSchedule);

    })
    .catch(err => {
      console.error(err);
      setProcessing(false);
    });

  }

  // Generates the voice output, use either webSpeechAPI or OpenAI
  const genVoiceOutput = (aiMessage: string) => {
      setAiTalking(true);
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(aiMessage);
      const voices = synth.getVoices();
      const englishVoice = voices.find(v => v.lang.toLowerCase().startsWith("en"));

      utterance.voice = englishVoice || voices[0];
      utterance.rate = 1.2;
      utterance.pitch = 1.8;
      utterance.lang = "en-US";

      // Without these, the button stays stuck on "Stop Agent" after speech ends naturally
      utterance.onend = () => setAiTalking(false);
      utterance.onerror = () => setAiTalking(false);

      synth.cancel();
      synth.speak(utterance);
  }

  return (

    <>
      <button
        onClick={recording ? stopRecording : aiTalking ? stopAISpeaking : processing ? undefined : startRecording}
        disabled={processing}
        className={`rounded-2xl w-full mb-6 p-3 text-white font-bold ${processing ? "cursor-not-allowed opacity-70" : "cursor-pointer"} ${
          recording ? "bg-red-500 hover:bg-red-600" : processing ? "bg-gray-400" : aiTalking ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {recording ? "Stop Talking" : processing ? "Processing…" : aiTalking ? "Stop Agent" : "Talk to Agent"}
      </button>

      {/* {audioURL && (
        <div className="mt-6">
          <audio autoPlay src={audioURL} />
        </div>
      )} */}
    </>

  );
}
