'use client'

import { useEffect, useState } from "react";
import { MinusCircleIcon, PlusCircleIcon, TrashIcon, ArrowsUpDownIcon  } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from 'next/navigation'; // App Router

import { supabase } from '../utils/supabase'
import { User } from '@supabase/supabase-js';

export default function EditableTable() {

  // Specifies the type of the response that will be coming in 
  type SceneRow = {
    id: number; // unique key for your table
    scene_number: number;
    scene_heading: string;
    location_type: string;
    location_name: string;
    sub_location_name: string;
    time_of_day: string;
    characters: string[];
    props: string[];
    wardrobe: string[];
    set_dressing: string[];
    vehicles: string[];
    vfx: string[];
    sfx: string[];
    stunts: string[];
    extras: string[];
    lines_count: number;
    page_estimate: number;
    scene_summary: string;
    estimatedTime: number;
  };

  const router = useRouter();
  const [scenesData, setScenesData] = useState<SceneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [modalConfig, setModalConfig] = useState({
    display: false,
    name: "",
    fieldName: "" as keyof SceneRow,
    scene: 0
  });
  const [itemToAdd, setItemToAdd] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [savedScripts, setSavedScripts] = useState<{ id: string; script_name: string }[]>([]);  
  const [currentScriptId, setCurrentScriptId] = useState<number | null>(null);

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


  // When User Wants to Change Some Stuff
  const handleChange = ( scene_number: number, field: keyof SceneRow, value: string) => {
    setScenesData(prev =>
      prev.map(row => (row.scene_number === scene_number ? { ...row, [field]: value } : row))
    );
  };

  // When characters or props need to change - Needs to Optimize
  const handleChangeArray = (
    scene_number: number,
    field: keyof SceneRow,
    index: number,
    value: string
  ) => {      
    setScenesData(prev =>
      prev.map(row => {
        if (row.scene_number !== scene_number) return row;

        const updatedArray = [...(row[field] as string[])];
        updatedArray[index] = value;

        return {
          ...row,
          [field]: updatedArray
        };
      })
    );
  };


  /*
    WHY WE USE FILTER/SPREAD INSTEAD OF PUSH/SPLICE:

    SIMPLE RULE:
    - push, splice, pop = modify original (React won't see changes)
    - filter, map, [...arr] = create new copy (React sees changes and updates screen)
    
    React detects changes by comparing array references (like checking ID cards).
    Same reference = no update. New reference = update!
  */

  const removeItem = (scene_number: number, field: keyof SceneRow, value: string) => {
    setScenesData(prev =>
      prev.map(row => 
        row.scene_number === scene_number 
          ? { 
              ...row, 
              [field]: Array.isArray(row[field]) 
                ? row[field].filter((item: string) => item !== value)
                : row[field]
            } 
          : row
      )
    );
  };

  const addItem = (scene_number: number, field: keyof SceneRow, value: string) => {
    setScenesData(prev =>
      prev.map(row => 
        row.scene_number === scene_number 
          ? { 
              ...row, 
              [field]: Array.isArray(row[field]) 
                ? [...row[field], value]
                : row[field]
            } 
          : row
      )
    );
  };

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

  const deleteScene = (scene_to_remove: number) => {
    setScenesData(prev  => prev.filter(scene => scene.scene_number != scene_to_remove))
  }

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


  const orderScenes = () => {
    setScenesData(prev =>
      [...prev].sort((a, b) => a.scene_number - b.scene_number)
    );
  };


  return (

    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-4">Scene Breakdown</h1>

      {/* Uploading The files  - Need a fix in here as the input is only take from a very small area */}
      <div className="relative text-center border-2 border-dashed border-gray-300 rounded-lg mb-3 p-6 cursor-pointer hover:border-blue-400 transition">
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
            className="w-full border rounded px-2 py-1 mb-5"
            onChange={(e) => loadSavedScript(Number(e.target.value))}
          >
            <option value="" disabled>Select a script</option>

            {savedScripts.map(script => (
              <option key={script.id} value={script.id}>
                {script.script_name}
              </option>
            ))}
          </select>        
        </>
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
            <button className="bg-yellow-400 hover:bg-yellow-500 rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer"
            onClick={addScene}
            >Add Scene</button>
            <button className="bg-blue-400 hover:bg-blue-500 rounded-2xl w-full mb-6 p-3 text-white font-bold cursor-pointer">Genertae Schedule</button>
          </div>
        </>
      )}


      {/* Modal To Add New Items */}
      {modalConfig.display && (
        <>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-20 bg-white border rounded-lg shadow-lg p-6 w-80 md:w-120">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Add {modalConfig.name}</h2>
            <input
              type="text"
              name="itemToAdd"
              id="itemToAdd"
              placeholder={`Add the ${modalConfig.name}`}
              autoFocus
              className="w-full text-center border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
              onChange={(e) => setItemToAdd(e.target.value)}
            />

            <div className="flex justify-center gap-4">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              onClick={() => {addItem(modalConfig.scene, modalConfig.fieldName, itemToAdd)}}>
                Add
              </button>
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition cursor-pointer"
                onClick={() =>
                  setModalConfig(prev => ({
                    ...prev,
                    display: false,
                  }))
                }
              >
                Cancel
              </button>
            </div>
          </div>                
        </>
      )}


      {/* Editing The Extracted Contents from Scenes */}
      {user && !loading && (
        <>

          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow">
            <table className="min-w-[1400px] table-fixed w-full border-collapse text-sm">

              <thead className="bg-gray-100">
                <tr>
                  {[
                    { name: "Delete", width: "w-10" },
                    { name: "Scene", width: "w-20", icon: true },
                    { name: "Location Type", width: "w-20" },
                    { name: "Time of Day", width: "w-20" },
                    { name: "Location Name", width: "w-30" },
                    { name: "Sub-Location", width: "w-30" },
                    { name: "Description", width: "w-30" },
                    { name: "Characters",  width: "w-30" },
                    { name: "BG Talent",  width: "w-30" },
                  ].map((header,idx) => (
                    <th
                      key={idx}
                      className={`border-b border-gray-300 px-3 py-2 text-left font-medium whitespace-nowrap ${header.width}`}
                    >
                      <div className="flex justify-between font-bold">
                        {header.name}
                        {header.icon && (
                          <>
                          <ArrowsUpDownIcon className="w-5 h-5 mb-1 text-black cursor-pointer"
                          onClick={orderScenes}
                          />
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {scenesData.map((row,idx) => (
                  <tr
                    key={idx}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                  >

                    {/* Scene Number */}
                    <td className="px-3 py-2">
                        <TrashIcon className="w-5 h-5 m-auto mb-1 text-red-500 hover:text-red-700 cursor-pointer"
                        onClick={() => deleteScene(row.scene_number)}
                        ></TrashIcon>
                    </td>

                    {/* Scene Number */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={row.scene_number}
                        onChange={e =>
                          handleChange(row.scene_number, "scene_number", e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    {/* Location Type */}
                    <td className="px-3 py-2">
                      <select
                        value={row.location_type}
                        onChange={e =>
                          handleChange(row.scene_number, "location_type", e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="EXT">EXT</option>
                        <option value="INT">INT</option>
                      </select>
                    </td>

                    {/* Time of Day */}
                    <td className="px-3 py-2">
                      <select
                        value={row.time_of_day}
                        onChange={e =>
                          handleChange(row.scene_number, "time_of_day", e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="DAY">DAY</option>
                        <option value="NIGHT">NIGHT</option>
                      </select>
                    </td>

                    {/* Location Name */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.location_name}
                        onChange={e =>
                          handleChange(row.scene_number, "location_name", e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    {/* Sub Location */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.sub_location_name}
                        onChange={e =>
                          handleChange(row.scene_number, "sub_location_name", e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    {/* Description */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={row.scene_summary}
                        onChange={e =>
                          handleChange(row.scene_number, "scene_summary", e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    {/* Displaying the Characters */}
                    <td className="px-3 py-2">

                      {/* To add new Items */}
                      <div key={idx} className="flex justify-between">
                        <p className="mr-2">{""}</p>
                        <PlusCircleIcon className="w-5 h-5 mb-1 text-blue-500 cursor-pointer hover:text-blue-700 shrink-0"
                        onClick={() =>
                          setModalConfig({
                            display: true,
                            name: "Characters",
                            fieldName: "characters",
                            scene: row.scene_number
                          })
                        }>
                        </PlusCircleIcon>
                      </div>

                      {row.characters.map((character,idx) => {
                        return(
                          <div key={idx} className="flex justify-between">
                            <input type ="text" className="mr-2 min-w-0 border-b focus:outline-none" value={character}
                            onChange={e =>
                              handleChangeArray(row.scene_number, "characters", idx, e.target.value)
                            }
                            />
                            <MinusCircleIcon className="w-5 h-5 mb-1 text-red-500 cursor-pointer
                             hover:text-red-700 shrink-0" onClick={() => removeItem(row.scene_number, "characters", character)}/>
                          </div>
                        )
                      })}
                    </td>

                    {/* Displaying the Extra Characters */}
                    <td className="px-3 py-2">

                      {/* To add new Items */}
                      <div key={idx} className="flex justify-between">
                        <p className="mr-2">{""}</p>
                        <PlusCircleIcon className="w-5 h-5 mb-1 text-blue-500 cursor-pointer hover:text-blue-700 shrink-0"
                        onClick={() =>
                          setModalConfig({
                            display: true,
                            name: "BG Talent",
                            fieldName: "extras",
                            scene: row.scene_number
                          })
                        }>
                        </PlusCircleIcon>
                      </div>

                      {row.extras.map((extra,idx) => {
                        return(
                          <div key={idx} className="flex justify-between">
                            <input type ="text" className="mr-2 min-w-0 border-b focus:outline-none" value={extra}
                            onChange={e =>
                              handleChangeArray(row.scene_number, "extras", idx, e.target.value)
                            }
                            />
                            <MinusCircleIcon className="w-5 h-5 mb-1 text-red-500 cursor-pointer
                             hover:text-red-700 shrink-0" onClick={() => removeItem(row.scene_number, "extras", extra)}/>
                          </div>
                        )
                      })}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* <pre className="mt-4 overflow-x-scroll">{JSON.stringify(data, null, 2)}</pre> */}

        </>
      )}        

    </div>

  );

}
