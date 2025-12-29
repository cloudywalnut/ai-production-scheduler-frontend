'use client'

import { useState } from "react";
import { SceneRow } from "../types/types";
import {  AddItemModalType } from "../types/types";

interface AddItemModalProps {
  setScenesData: React.Dispatch<React.SetStateAction<SceneRow[]>>;
  addItemModalConfig: AddItemModalType;
  setAddItemModalConfig: React.Dispatch<React.SetStateAction<AddItemModalType>>;
}

export default function AddItemModal({ setScenesData, addItemModalConfig, setAddItemModalConfig }: AddItemModalProps) {


    /*
        WHY WE USE FILTER/SPREAD INSTEAD OF PUSH/SPLICE:

        SIMPLE RULE:
        - push, splice, pop = modify original (React won't see changes)
        - filter, map, [...arr] = create new copy (React sees changes and updates screen)
        
        React detects changes by comparing array references (like checking ID cards).
        Same reference = no update. New reference = update!
    */

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

    const [itemToAdd, setItemToAdd] = useState("");

    return (
        <>

            {addItemModalConfig.display && (
                <>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-20 bg-white border rounded-lg shadow-lg p-6 w-80 md:w-120">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 text-center">Add {addItemModalConfig.name}</h2>
                    <input
                    type="text"
                    name="itemToAdd"
                    id="itemToAdd"
                    placeholder={`Add the ${addItemModalConfig.name}`}
                    autoFocus
                    className="w-full text-center border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
                    onChange={(e) => setItemToAdd(e.target.value)}
                    />

                    <div className="flex justify-center gap-4">
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    onClick={() => {addItem(addItemModalConfig.scene, addItemModalConfig.fieldName, itemToAdd)}}>
                        Add
                    </button>
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition cursor-pointer"
                        onClick={() =>
                        setAddItemModalConfig(prev => ({
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

        </>
    )
}