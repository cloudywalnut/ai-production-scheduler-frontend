'use client'

import Image from "next/image";
import { UserProjectsType } from "../types/types";
import { useState } from "react";
import EditProjectModal from "./editProjectModal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { supabase } from '../utils/supabase'

interface AllProjectsProps {
    userProjects: UserProjectsType[];
    setUserProjects: React.Dispatch<React.SetStateAction<UserProjectsType[]>>;
    setAddProject: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedProjectId: React.Dispatch<React.SetStateAction<null | number>>
}

export function AllProjects({userProjects, setUserProjects, setAddProject, setSelectedProjectId}: AllProjectsProps){
    
    const [currentProject, setCurrentProject] = useState<UserProjectsType>();
    
    function openProject(projectId: number){
        setAddProject(false)
        setSelectedProjectId(projectId);
    }

    // Compplete this logic today when back home
    function handleEdit(project: UserProjectsType){
        setCurrentProject(project);
        setEditModalDisplay(true);
    }

    async function handleDelete(projectId: string){
        const {data, error} = await supabase
            .from('Projects')
            .delete()
            .eq('id', projectId);

        if (!error){
            setUserProjects(prev => prev.filter(project => project.id != projectId))
            alert('The Project was Successfullt Deleted');
        }else{
            alert('Deletion of the Script Failed')
        }
    }

    const [editModalDisplay, setEditModalDisplay] = useState(false);
    
    return (
        <div>

            {/* Action button and image if no Projects */}
            {userProjects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-5">
                    <Image
                        src="/lights.png"
                        alt="No Projects"
                        width={280}
                        height={280}
                        priority
                        className="rounded-2xl opacity-80"
                    />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">No Projects Yet</p>
                        <p className="text-sm text-gray-600 mt-1">Create a new one to get started.</p>
                    </div>
                    <button
                        className="bg-black text-white cursor-pointer text-sm px-6 py-2.5 rounded-xl hover:bg-gray-800 transition"
                        onClick={() => setAddProject(true)}
                    >
                        + Create Project
                    </button>
                </div>
            )}

            {/* Displaying available Projects */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-4">
                {userProjects.map((project) => (
                    <div
                        key={project.id}
                        className="group border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all duration-200 bg-white"
                        onClick={() => openProject(Number(project.id))}
                    >
                        {/* Thumbnail */}
                        <div className="w-full h-36 bg-gray-100 overflow-hidden">
                            <Image
                                src="/project.png"
                                alt={project.name}
                                width={360}
                                height={144}
                                priority
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0 space-y-2">

                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Project Name</p>
                                        <h2 className="text-base font-bold text-gray-900 truncate">{project.name}</h2>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Type</p>
                                        <p className="text-sm font-medium text-gray-700">{project.type}</p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Description</p>
                                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                            {project.description}
                                        </p>
                                    </div>

                                </div>

                                <div className="flex flex-col gap-1.5 shrink-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(project) }}
                                        className="p-1.5 cursor-pointer rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}
                                        className="p-1.5 cursor-pointer rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* To display the Edit Project Modal */}
            {editModalDisplay && (
                <EditProjectModal
                    editModalDisplay={editModalDisplay}
                    setEditModalDisplay={setEditModalDisplay}
                    setUserProjects = {setUserProjects} 
                    projectId={currentProject!.id}
                    name={currentProject!.name}
                    type={currentProject!.type}
                    description={currentProject!.description}
                />
            )}

        </div>
    ) 
}