// app/audio-record/page.tsx
"use client";

// useRef is a react hook in which we can change its .current value and it doesnt trigger re render
// this means that even if the value changes the changes wont be like visible in UI as there is no re render
import { useState, useRef } from "react";

export default function Voice() {
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
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);


      // The audio data being parsed onto our API which will do the processing and give back the right function
      // to run to allow us to take actions accordingly
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      // Sending the audio to the API for being processed
      fetch('https://vodstr.up.railway.app/voice', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => console.log(data.filename))
      .catch(console.error);
      
      console.log(url)
      setAudioURL(url);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (

    <>

      <button
        onClick={recording ? stopRecording : startRecording}
        className={`rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer ${
          recording ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      {audioURL && (
        <div className="mt-6">
          <audio autoPlay src={audioURL} />
        </div>
      )}

    </>

  );
}
