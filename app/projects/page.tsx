'use client'

import Image from "next/image";
import { supabase } from '../utils/supabase'
import { FolderOpenIcon, ArrowLeftEndOnRectangleIcon, UserIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation'; // App Router
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import { UserProjectsType } from "../types/types";
import { ProjectHome } from "./projectHome";
import { AllProjects } from "./allProjects";


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


  function viewProjects(){
    setAddProject(false)
    setSelectedProjectId(null);
  }


  return (
    <div className="p-6 py-5">
      
      {/* Navigation */}
      <div className="flex justify-between items-center print:hidden mb-6 border-b border-gray-100 pb-4">
          <h1 className="hidden md:block text-xl font-bold tracking-tight text-gray-900">Script Breakdown & Scheduler</h1>
          <h1 className="block md:hidden text-xl font-bold tracking-tight text-gray-900">SBSS.</h1>

          <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1.5 cursor-pointer text-gray-500 hover:text-gray-800 transition" onClick={viewProjects}>
                  <FolderOpenIcon className="w-5 h-5" />
                  <span className="hidden lg:block text-sm font-medium">Projects</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-green-500 transition" onClick={() => router.replace('/profile')}>
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden lg:block text-sm font-medium">Profile</span>
              </div>
              <div className="flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-red-500 transition" onClick={signOut}>
                  <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
                  <span className="hidden lg:block text-sm font-medium">Logout</span>
              </div>
          </div>
      </div>
            
      {/* Add New Projects*/}
      {(addProject) && 
          <div className="grid grid-cols-5 gap-6 min-h-[400px]">
              
              {/* Left: Image */}
              <div className="col-span-5 md:col-span-3 p-10 flex flex-col items-center justify-center bg-gray-50 rounded-2xl order-2 md:order-1 border border-gray-200">
                  <Image
                      src="/lights.png"
                      alt="Loading"
                      width={300}
                      height={300}
                      priority
                      className="opacity-90"
                  />
                  <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mt-4">Create a New Project</h1>
                  <p className="text-sm md:text-base text-gray-600 text-center mt-2 max-w-sm">Plan, schedule and manage your film production all in one place.</p>
              </div>

              {/* Right: Form */}
              <div className="col-span-5 md:col-span-2 flex items-start justify-center order-1 md:order-2">
                  <form
                      className="w-full space-y-5"
                      onSubmit={(e) => {
                          e.preventDefault();
                          createProject(projectName, type, description);
                      }}
                  >
                      <div>
                          <label className="text-sm font-semibold text-gray-800 mb-1 block">Project Name</label>
                          <input
                              type="text"
                              placeholder="e.g. The Last Scene"
                              className="w-full border border-gray-400 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                              onChange={e => setProjectName(e.target.value)}
                          />
                      </div>

                      <div>
                          <label className="text-sm font-semibold text-gray-800 mb-1 block">Type</label>
                          <select
                              className="w-full border border-gray-400 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/20 transition bg-white"
                              onChange={e => setType(e.target.value)}
                          >
                              <option>Film</option>
                              <option>Web Series</option>
                              <option>Short Movie</option>
                          </select>
                      </div>

                      <div>
                          <label className="text-sm font-semibold text-gray-800 mb-1 block">Description</label>
                          <textarea
                              placeholder="Brief overview of your project..."
                              className="w-full border border-gray-400 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 transition resize-none"
                              onChange={e => setDescription(e.target.value)}
                              rows={4}
                          />
                      </div>

                      <button
                          type="submit"
                          className="w-full bg-black text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-800 transition cursor-pointer"
                      >
                          Create Project
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

      {/* View all Projects */}
      {!addProject && !selectedProjectId && (
        <AllProjects userProjects={userProjects} setUserProjects={setUserProjects} setAddProject={setAddProject} setSelectedProjectId={setSelectedProjectId}/>
      )}

      {/* Project Home */}
      {selectedProjectId && (
        <ProjectHome selectedProjectId={selectedProjectId}/>
      )}      

    </div>
  );
}