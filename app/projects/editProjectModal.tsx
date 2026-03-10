'use client'

import { useState } from "react";
import { supabase } from '../utils/supabase'
import { UserProjectsType } from "../types/types";


interface EditProjectModalProps {
    editModalDisplay: boolean;
    setEditModalDisplay: React.Dispatch<React.SetStateAction<boolean>>;
    setUserProjects: React.Dispatch<React.SetStateAction<UserProjectsType[]>>;
    projectId: string;
    name: string;
    type: string;
    description: string;
}

export default function EditProjectModal({ editModalDisplay, setEditModalDisplay, setUserProjects,
    projectId, name, type, description }: EditProjectModalProps) {

    const [projectName, setProjectName] = useState<string>(name);
    const [projectType, setProjectType] = useState<string>(type);
    const [projectDescription, setProjectDescription] = useState<string>(description);

    // Function to Edit the Project
    async function editProject(){
        const {data, error} = await supabase
            .from('Projects')
            .update([
            {
                name: projectName,
                type: projectType,
                description: projectDescription
            }
            ])
            .eq('id', projectId);

        if (!error){
            // To update the Parent
            setUserProjects(prev =>
                prev.map(p => p.id === projectId
                    ? { ...p, name: projectName, type: projectType, description: projectDescription }
                    : p
                )
            );
            setEditModalDisplay(false);
            alert("Project Details Updated Successfully");
        }else{
            alert("Project Details Updated Successfully");
        }
    }

    return (
        <>
            {editModalDisplay && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-20 bg-white border rounded-lg shadow-lg p-6 w-80 md:w-120">
                    
                    <h2 className="text-lg font-semibold text-gray-800 mb-6">Edit Project</h2>
                    
                    <div className="space-y-4">

                        <div>
                            <label className="text-sm font-semibold text-gray-800 mb-1 block">Project Name</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => {setProjectName(e.target.value)}}
                                className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-800 mb-1 block">Type</label>
                            <select className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm bg-white" 
                            value={projectType} onChange={(e) => {setProjectType(e.target.value)}}
                            >
                                <option>Film</option>
                                <option>Web Series</option>
                                <option>Short Movie</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-800 mb-1 block">Description</label>
                            <textarea
                                value={projectDescription}
                                onChange={(e) => {setProjectDescription(e.target.value)}}
                                className="w-full border border-gray-400 rounded-md px-3 py-2 text-sm resize-none"
                                rows={4}
                            />
                        </div>

                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition cursor-pointer"
                            onClick={() => editProject()}
                        >
                            Save
                        </button>
                        <button
                            className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-200 transition cursor-pointer"
                            onClick={() => setEditModalDisplay(false)}
                        >
                            Cancel
                        </button>
                    </div>

                </div>
            )}
        </>
    )
}