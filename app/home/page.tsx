'use client'

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation'; // App Router
import { supabase } from '../utils/supabase'
import { User } from '@supabase/supabase-js';
import Image from "next/image";
import { SceneRow, AddItemModalType } from "../types/types";
import EditableTable from "./table";
import AddItemModal from "./addItemModal";
import { ArrowLeftEndOnRectangleIcon   } from "@heroicons/react/24/outline";

export default function Home() {

  const router = useRouter();
  const [scenesData, setScenesData] = useState<SceneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [addItemModalConfig, setAddItemModalConfig] = useState<AddItemModalType>({
    display: false,
    name: "",
    fieldName: "" as keyof SceneRow,
    scene: 0
  });
  const [user, setUser] = useState<User | null>(null);
  const [savedScripts, setSavedScripts] = useState<{ id: string; script_name: string }[]>([]);  
  const [currentScriptId, setCurrentScriptId] = useState<number | null>(null);


  // Gets the User Authentication stuff runs initially
  useEffect(() => {
    async function checkUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.replace('/auth');
      } else {
        setUser(user);
      }
    }
    checkUser();
  },[router])


  // Runs only on refresh
  useEffect(() => {
    if (!user) return; // needed to make sure it always loads correctly as user might not be avlbl initially
    async function getScripts(){
      const {data, error} = await supabase
        .from('Scripts')
        .select('id, script_name')
        .eq('uid', user?.id);
     
        if (!error) {
          setSavedScripts(data)
        };

    }
    getScripts();
  }, [user])

  // signing out the user
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (!error){
      console.log('Signed Out')
    }
    router.replace('/');
  }

  // save new scripts and updated ones too
  const saveScript = async () =>{
    if (currentScriptId){
      await supabase
        .from('Scripts')
        .update([
          {
            script: scenesData,
          }
        ])
        .eq('id', currentScriptId);
    }else{
      await supabase
        .from('Scripts')
        .insert([
          {
            uid: user?.id,
            script: scenesData,
            script_name: file?.name
          }
        ]);
    }
    alert("Congrats Your Script has Been Saved Successfully");  
  }

  const deleteScript = async () =>{
    await supabase
      .from('Scripts')
      .delete()
      .eq('id', currentScriptId);

    setSavedScripts(prev => prev.filter(script => Number(script.id) != currentScriptId)) // updating in place else it will update only on reload
    setScenesData([]);
    setCurrentScriptId(null);
    setLoading(true);
    alert("Your Script has Been Deleted Successfully");  
  }


  const loadSavedScript = async (script_id: number) => {
    const {data, error} = await supabase
      .from('Scripts')
      .select('script')
      .eq('id', script_id)
      .single(); // needed when we need one entry
    
      if (!error) {
        setCurrentScriptId(script_id);
        setScenesData(data.script); // Worked After i changed the type to jsonb
        setLoading(false);
      };
  }


  const addScene = () => {
    setScenesData(prev => [
      {
        id: Date.now(),                // unique key
        scene_number: prev.length + 1, // auto increment
        scene_heading: "",
        location_type: "",          // default
        location_name: "",
        sub_location_name: "",
        time_of_day: "",            // default
        characters: [],
        props: [],
        wardrobe: [],
        set_dressing: [],
        vehicles: [],
        vfx: [],
        sfx: [],
        stunts: [],
        extras: [],
        lines_count: 0,
        page_estimate: 0,
        scene_summary: "",
        estimatedTime: 0
      },
      ...prev,
    ]);
  };

  // When Script is Uploaded
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return; // no file selected
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setLoading(true);
    setCurrentScriptId(null); // when new file set currentScriptId to null

    const formData = new FormData();
    formData.append("script", selectedFile); // key must match server-side multer field

    fetch("https://vodstr.up.railway.app/extract", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      setScenesData(data.scenesData);
      setLoading(false);
      setCurrentScriptId(null); // Set to null here again in case someone opened an existing script during loading
    })
    .catch(err => console.error(err));
  };

  return (

    <div className="p-6">

      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold mb-4">AI Script Scheduler</h1>
        <ArrowLeftEndOnRectangleIcon className="w-7 h-7 mb-1 text-red-500 cursor-pointer
          hover:text-red-700 shrink-0" onClick={signOut}/>
      </div>

      {/* Uploading The files  - Need a fix in here as the input is only take from a very small area */}
      <div className="relative text-center border-2 border-dashed border-gray-700 rounded-lg mb-3 p-6 cursor-pointer hover:border-blue-400 transition">
        <input
          type="file"
          accept=".pdf"
          className="absolute w-full h-full left-0 top-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        {!file ? (
          <p className="text-gray-500">Click or Drag your script here to Upload</p>
        ) : (
          <>
            <p className="text-gray-700">{file.name}</p>
            <p className="text-gray-700 underline">Choose Another File</p>
          </>
        )}
      </div>


      {/* View Saved Scripts */}
      {user && (
        <>
          <h2 className="font-semibold mb-2">Select a Saved Script</h2>
          <select
            defaultValue=""
            className="w-full border rounded p-3 mb-5"
            onChange={(e) => loadSavedScript(Number(e.target.value))}
          >
            <option value="">Select a script</option>

            {savedScripts.map(script => (
              <option key={script.id} value={script.id}>
                {script.script_name}
              </option>
            ))}
          </select>        
        </>
      )}


      {/* Image to Appear when Nothing Uploaded or Selected */}
      {!file && loading && (
        <div className="flex flex-col justify-center items-center w-full m-auto">
          <Image
            src="/director.png"
            alt="Loading"
            width={360}
            height={360}
            priority
          />
          <p className="mt-1 text-gray-700 text-center text-2xl max-w-80 font-bold">
            Upload a New Script or Choose A Saved Script
          </p>
        </div>
      )}


      {/* Loader to Appear when data is not yet available */}
      {file && loading && (
        <div className="flex flex-col justify-center items-center w-full m-auto">
          <Image
            src="/loader.gif"
            alt="Loading"
            width={60}
            height={60}
            priority
          />
          <p className="mt-2 text-gray-700 text-center">
            Please wait while we are processing your script
          </p>
        </div>
      )}


      {/* Display the Generate Schedule Button */}
      {!loading && (
        <>
          <div className="flex justify-between gap-2">

            <button className="bg-green-400 hover:bg-green-500 rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer"
            onClick={saveScript}
            >{currentScriptId ? "Update Script": "Save Script"}</button>

            {currentScriptId && (
              <button className="bg-red-400 hover:bg-red-500 rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer"
              onClick={deleteScript}
              >Delete Script</button>              
            )}

            <button className="bg-yellow-400 hover:bg-yellow-500 rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer"
            onClick={addScene}
            >Add Scene</button>

            <button className="bg-blue-400 hover:bg-blue-500 rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer">Genertae Schedule</button>

          </div>
        </>
      )}


      {/* Modal To Add New Items */}
      <AddItemModal
        setScenesData={setScenesData}
        addItemModalConfig={addItemModalConfig}
        setAddItemModalConfig={setAddItemModalConfig}
      />


      {/* Editing The Extracted Contents from Scenes */}
      {user && !loading && (

        <EditableTable
          scenesData={scenesData}
          setScenesData={setScenesData}
          setAddItemModalConfig={setAddItemModalConfig}
        />

      )}        

    </div>

  );

}