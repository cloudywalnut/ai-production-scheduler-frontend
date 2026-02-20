'use client'

import { MinusCircleIcon, PlusCircleIcon, TrashIcon, ArrowsUpDownIcon  } from "@heroicons/react/24/outline";
import { AddItemModalType, SceneRow } from "../types/types";

interface EditableTableProps {
  scenesData: SceneRow[];
  setScenesData: React.Dispatch<React.SetStateAction<SceneRow[]>>;
  setAddItemModalConfig: React.Dispatch<React.SetStateAction<AddItemModalType>>;
}

export default function EditableTable({ scenesData, setScenesData, setAddItemModalConfig }: EditableTableProps){
    
    // Add validation logic in here to not take more then one letter space or extra characters
    const handleSceneNumChange = (idx: number, sceneNumber: string) => {
      const regex = /^\d*[A-Za-z]?$/;
      if (scenesData.some(s => s.scene_number == sceneNumber)){
        alert("The scene number you are trying to key in already exists");
        return;
      }
      if (sceneNumber.match(regex)){
        const changedScenesData: SceneRow[] = [...scenesData];
        changedScenesData[idx].scene_number = sceneNumber;
        setScenesData(changedScenesData);
      }
    }

  
    // When User Wants to Change Some Stuff
    const handleChange = ( scene_number: string, field: keyof SceneRow, value: string) => {
      setScenesData(prev =>
        prev.map(row => (row.scene_number === scene_number ? { ...row, [field]: value } : row))
      );
    };

    // When characters or props need to change - Needs to Optimize
    const handleChangeArray = (
      scene_number: string,
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

    const removeItem = (scene_number: string, field: keyof SceneRow, value: string) => {
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

    const deleteScene = (scene_to_remove: string) => {
      setScenesData(prev  => prev.filter(scene => scene.scene_number != scene_to_remove))
    }

    // Add the scene re ordering logic now with letters introduced as well
    const orderScenes = () => {
      setScenesData(prev =>
        [...prev].sort((a, b) => {
          if (parseInt(a.scene_number) != parseInt(b.scene_number)) {
            return parseInt(a.scene_number) - parseInt(b.scene_number);
          } else {
            const aStr = a.scene_number.toString();
            const bStr = b.scene_number.toString();

            const suffixA = aStr[aStr.length - 1];
            const suffixB = bStr[bStr.length - 1];

            return suffixA.charCodeAt(0) - suffixB.charCodeAt(0);
          }
        })
      );
    };

    return (
        <>
    
          <div className="overflow-x-auto rounded-lg border border-gray-300 bg-white shadow">
            <table className="min-w-[1400px] table-fixed w-full border-collapse text-sm">

              <thead className="bg-gray-100">
                <tr>
                  {[
                    { name: "Delete", width: "w-10" },
                    { name: "Scene", width: "w-20", icon: true },
                    { name: "Est Time", width: "w-20" },
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
                        type="text"
                        value={row.scene_number}
                        onChange={e =>
                          handleSceneNumChange(idx, e.target.value)
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    {/* Scene Estimated Time */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={row.estimatedTime}
                        onChange={e =>
                          handleChange(row.scene_number, "estimatedTime", e.target.value)
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
                        <option value="EVENING">EVENING</option>
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
                          setAddItemModalConfig({
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
                          setAddItemModalConfig({
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
    
        </>
    )
}