'use client'

import Image from "next/image";
import { supabase } from '../utils/supabase'
import { FolderOpenIcon, ArrowLeftEndOnRectangleIcon   } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation'; // App Router
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import { UserProjectsType } from "../types/types";

export default function Project() {

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [projectName, setProjectName] = useState("");
  const [type, setType] = useState("Film");
  const [description, setDescription] = useState("");
  const [userProjects, setUserProjects] = useState<UserProjectsType[]>([]);
  const [addProject, setAddProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<null | number>(null);

  // Gets the User Authentication stuff runs initially
  useEffect(() => {
    async function checkUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.replace('/auth');
      } else {
        setUser(user);
        setAddProject(false); // Should be False on Startup
      }
    }
    checkUser();
  },[router])


  // Load users project on startup - Runs only on refresh
  useEffect(() => {
    if (!user) return; // needed to make sure it always loads correctly as user might not be avlbl initially
    async function getProjects(){
      const {data, error} = await supabase
        .from('Projects')
        .select('id, name, type, description')
        .eq('uid', user?.id);
     
        if (!error) {
          setUserProjects(data)
        };

    }
    getProjects();
  }, [user])


  // signing out the user
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (!error){
      console.log('Signed Out')
    }
    router.replace('/');
  }

  async function createProject(name: string, type: string, description: string){
    const {data, error} = await supabase
    .from('Projects')
    .insert([
      {
        uid: user?.id,
        name,
        type,
        description
      }
    ]).select('id, name, type, description').single();

    if (!error){
      setAddProject(false)
      setUserProjects([...userProjects, data])
    }

  }

  function openProject(projectId: number){
    setAddProject(false)
    setSelectedProjectId(projectId);
  }

  function viewProjects(){
    setAddProject(false)
    setSelectedProjectId(null);
  }

  function goToScripts() {
    // Use backticks to easily insert your variable into the string
    router.push(`/home?projectId=${selectedProjectId}`);
  }

  return (
    <div className="p-6">
      
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold mb-4">AI Script Scheduler</h1>
        <div className="flex gap-5">
          <FolderOpenIcon className="w-7 h-7 mb-1 text-black cursor-pointer
            shrink-0" onClick={viewProjects}/>
          <ArrowLeftEndOnRectangleIcon className="w-7 h-7 mb-1 text-red-500 cursor-pointer
            hover:text-red-700 shrink-0" onClick={signOut}/>
        </div>
      </div>
            
      {/* When no Projects Exists UI or when user wants to add a new project*/}
      {(addProject) && 
        <div className="grid grid-cols-5 gap-6 min-h-[400px]">
          
          {/* Left: Image */}
          <div className="col-span-5 md:col-span-3 p-10 flex flex-col items-center justify-center bg-amber-50 rounded-2xl order-2 md:order-1">
            <Image
              src="/lights.png"
              alt="Loading"
              width={360}
              height={360}
              priority
            />
            <h1 className="text-2xl md:text-4xl font-bold p-2 text-center">Create a New Project</h1>
            <h3 className="text-1xl md:text-2xl font-medium text-center">Create a New Project to Plan and Manage your Film</h3>
          </div>

          {/* Right: Form */}
          <div className="col-span-5 md:col-span-2 flex items-start order-1 md:order-2">
            <form className="w-full space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              createProject(projectName, type, description);
            }}
          >

              <input
                type="text"
                placeholder="Project name"
                className="w-full border rounded-md px-3 py-2"
                onChange={e => setProjectName(e.target.value)}
              />

              <select className="w-full border rounded-md px-3 py-2"
              onChange={e => setType(e.target.value)}>
                  <option>Film</option>
                  <option>Web Series</option>
                  <option>Short Moview</option>
              </select>

              <textarea
                placeholder="Description"
                className="w-full border rounded-md px-3 py-2"
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />

              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md hover:cursor-pointer"
              >
                Create
              </button>

            </form>
          </div>

        </div>
      
      }

      {/* Floating Button to Add New Projects */}
      {!addProject && !selectedProjectId && 
        <button className="
          fixed bottom-6 right-6
          bg-black text-white
          w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-lg
          hover:scale-105 transition
          hover:cursor-pointer
          text-2xl
        "
        onClick={() => setAddProject(true)}
        >
          +
        </button>      
      }

      {!addProject && !selectedProjectId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {userProjects.map((project) => (
            <div
              key={project.id}
              className="border rounded-2xl p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => openProject(Number(project.id))}
            >
              {/* Image Placeholder */}
              <div className="h-36 w-full bg-gray-200 rounded-xl mb-4 flex items-center justify-center text-gray-400">
                Image
              </div>

              {/* Project Info */}
              <h2 className="text-lg font-semibold">
                <b>Project Name: </b>{project.name}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                <b>Project Name: </b>{project.type}
              </p>

              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                <b>Project Description: </b>{project.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {selectedProjectId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            <div
              className="border rounded-2xl p-4 cursor-pointer hover:shadow-md transition"
              onClick={goToScripts}
            >
              {/* Image Placeholder */}
              <div className="h-36 w-full bg-gray-200 rounded-xl mb-4 flex items-center justify-center text-gray-400">
                Image
              </div>

              {/* Project Info */}
              <h2 className="text-lg font-semibold">
                <b>Script Scheduler</b>
              </h2>

            </div>
        </div>
      )}      


    </div>
  );
}