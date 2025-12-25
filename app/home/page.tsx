'use client'

import { useEffect, useState } from "react";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";


export default function EditableTable() {

  // Specifies the type of the response that will be coming in 
  type SceneRow = {
    id: number; // unique key for your table
    scene_number: number;
    scene_heading: string;
    location_type: "EXT" | "INT";
    location_name: string;
    sub_location_name: string;
    time_of_day: "DAY" | "NIGHT";
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


  const [data, setData] = useState<SceneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);


  useEffect(()=>{
    fetch("/api/getSchedule", {
      method: "GET",
    })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      setData(data.scenesData);
      setLoading(false);
    })
    .catch(err => console.error(err));

  },[])


  // When User Wants to Change Some Stuff
  const handleChange = ( scene_number: number, field: string, value: string) => {
    setData(prev =>
      prev.map(row => (row.scene_number === scene_number ? { ...row, [field]: value } : row))
    );
  };

  // When User Wants to Change Some Stuff
  const removeItem = ( scene_number: number, field: string, value: string) => {
    setData(prev =>
      prev.map(row => (row.scene_number === scene_number ? { ...row, [field]: [] } : row))
    );
  };


  // When Script is Uploaded
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return; // no file selected
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const formData = new FormData();
    formData.append("script", selectedFile); // key must match server-side multer field

    fetch("https://vodstr.up.railway.app/extract", {
      method: "POST",
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      setData(data.scenesData);
      setLoading(false);
    })
    .catch(err => console.error(err));
  };


  return (

    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-4">Scene Breakdown</h1>

      {/* Uploading The files  - Need a fix in here as the input is only take from a very small area */}
      <div className="relative text-center border-2 border-dashed border-gray-300 rounded-lg mb-6 p-6 cursor-pointer hover:border-blue-400 transition">
        <input
          type="file"
          accept=".pdf"
          className="absolute w-full h-full left-0 top-0 opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        {!file ? (
          <p className="text-gray-500">Click or Drag your script here to Upload</p>
        ) : (
          <p className="text-gray-700">{file.name}</p>
        )}
      </div>

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


      {/* Editing The Extracted Contents from Scenes */}
      {!loading && (
        <>

          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow">
            <table className="min-w-[1400px] table-fixed w-full border-collapse text-sm">

              <thead className="bg-gray-100">
                <tr>
                  {[
                    { name: "Scene #", width: "w-20" },
                    { name: "Location Type", width: "w-20" },
                    { name: "Time of Day", width: "w-20" },
                    { name: "Location Name", width: "w-30" },
                    { name: "Sub-Location", width: "w-30" },
                    { name: "Description", width: "w-30" },
                    { name: "Characters", "addIcon": true, width: "w-30" },
                    { name: "BG Talent", "addIcon": true, width: "w-30" },
                  ].map((header) => (
                    <th
                      key={header.name}
                      className={`border-b border-gray-300 px-3 py-2 text-left font-medium whitespace-nowrap ${header.width}`}
                    >
                      <div className="flex justify-between font-bold">
                        {header.name}
                        {header.addIcon && (
                          <div>
                            <PlusCircleIcon className="w-5 h-5 mb-1 text-blue-500 cursor-pointer hover:text-blue-700 shrink-0" />
                          </div>
                        )}
                        </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((row,idx) => (
                  <tr
                    key={idx}
                    className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition"
                  >

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
                      {row.characters.map((character,idx) => {
                        return(
                          <div key={idx} className="flex justify-between">
                            <p className="mr-2">{character}</p>
                            <MinusCircleIcon className="w-5 h-5 mb-1 text-red-500 cursor-pointer
                             hover:text-red-700 shrink-0" onClick={() => removeItem(row.scene_number, "characters", character)}/>
                          </div>
                        )
                      })}
                    </td>

                    {/* Displaying the Extra Characters */}
                    <td className="px-3 py-2">
                      {row.extras.map((extra,idx) => {
                        return(
                          <div key={idx} className="flex justify-between">
                            <p className="mr-2">{extra}</p>
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

          <pre className="mt-4 overflow-x-scroll">{JSON.stringify(data, null, 2)}</pre>

        </>
      )}        

    </div>

  );

}
