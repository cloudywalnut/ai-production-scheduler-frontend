// app/audio-record/page.tsx
"use client";

// useRef is a react hook in which we can change its .current value and it doesnt trigger re render
// this means that even if the value changes the changes wont be like visible in UI as there is no re render
import { useState, useRef } from "react";
import { AIResponseType, MessagesType, ShootingDay } from "../types/types";


interface VoiceProps {
  messages: MessagesType[];
  setMessages: React.Dispatch<React.SetStateAction<MessagesType[]>>;
  schedule: ShootingDay[]
  setSchedule: React.Dispatch<React.SetStateAction<ShootingDay[]>>;
}


export default function Voice({messages, setMessages, schedule, setSchedule}: VoiceProps) {

  const [recording, setRecording] = useState(false);
  const [aiTalking, setAiTalking] = useState(false);
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
      .catch(console.error);
      
      setAudioURL(url);

    };

    mediaRecorder.start();
    setRecording(true);
  };

  // Action to take when recording stops
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // To stop ai from speaking
  const stopAISpeaking = () => {
    // Stops the previous speaking going on when new recording starts
    window.speechSynthesis.cancel();
    setAiTalking(false);
  }

  // Set the Agent Behaviour over here
  const agentResponse = (userMessage: string) => {
    
    const formattedSchedule = schedule.map(day => ({
      day: day.day,
      totalTime: day.totalTime,
      scenes: day.scenes.map(s => ({
        scene_number: s.scene_number,
        scene_heading: s.scene_heading,
        location_type: s.location_type,
        location_name: s.location_name,
        sub_location_name: s.sub_location_name,
        time_of_day: s.time_of_day,
        characters: s.characters,
        ...(s.props?.length && { props: s.props }),
        ...(s.wardrobe?.length && { wardrobe: s.wardrobe }),
        ...(s.set_dressing?.length && { set_dressing: s.set_dressing }),
        ...(s.vehicles?.length && { vehicles: s.vehicles }),
        ...(s.vfx?.length && { vfx: s.vfx }),
        ...(s.sfx?.length && { sfx: s.sfx }),
        ...(s.stunts?.length && { stunts: s.stunts }),
        ...(s.extras?.length && { extras: s.extras }),
        scene_summary: s.scene_summary,
        estimatedTime: s.estimatedTime
      }))
    }));

    fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        history: messages.slice(-5),
        userMessage,
        formattedSchedule
      }),
    })
    .then(res => res.json())
    .then((data) => {

      const aiResponse = data.aiResponse;
      setMessages(prev => [...prev, { fromUser: false, text: aiResponse.response }]);
      genVoiceOutput(aiResponse.response)
      agentAction(aiResponse)

    })
    .catch(err => console.error(err));

  }

  // Generates the voice output, use either webSpeechAPI or OpenAI
  const genVoiceOutput = (aiMessage: string) => {
      setAiTalking(true);
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

  // Set which function the agent calls over here.
  const agentAction = (aiResponse: AIResponseType) => {
    if (aiResponse.swap_type == "none") return;
    if (aiResponse.swap_type == "move"){
      const {day_from, day_to, scene_active}= aiResponse
      if (day_from && day_to && scene_active){        
        const updatedSchedule = schedule.map(day => ({
            ...day,
            scenes: [...day.scenes]
        }));
        
        // The main update logic
        const scenesIndex = updatedSchedule[Number(day_from)-1].scenes.findIndex(s => s.scene_number == scene_active)
        const sceneContent = updatedSchedule[Number(day_from)-1].scenes.splice(scenesIndex, 1)
        updatedSchedule[Number(day_to)-1].scenes.push(sceneContent[0])
        
        setSchedule(updatedSchedule);
      }
    }
  }


  return (

    <>
      <button
        onClick={recording ? stopRecording : aiTalking ? stopAISpeaking : startRecording}
        className={`rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer ${
          recording ? "bg-red-500 hover:bg-red-600" : aiTalking ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {recording ? "Stop Talking" : aiTalking ? "Stop Agent" : "Talk to Agent"}
      </button>

      {/* {audioURL && (
        <div className="mt-6">
          <audio autoPlay src={audioURL} />
        </div>
      )} */}
    </>

  );
}
