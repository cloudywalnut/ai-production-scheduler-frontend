'use client'

import { supabase } from '../utils/supabase'
import { FolderOpenIcon, ArrowLeftEndOnRectangleIcon, UserIcon } from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation'; // App Router
import { useEffect, useState } from "react";
import { User } from '@supabase/supabase-js';
import Image from "next/image";

export default function Project() {

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState<string>("");
  const [organization, setOrginization] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [changePasswordFlag, setChangePasswordFlag] = useState<boolean>(false);

  // Gets the User Authentication stuff runs initially
  useEffect(() => {

    // get the Profile details
    async function getProfileDetails(userId: string){
        const { data, error } = await supabase
        .from('Users')
        .select('*')      // columns to fetch
        .eq('uid', userId)
        .single()
        
        if (!error){
            setName(data.name)
            setOrginization(data.organization);
        }
    }

    async function checkUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.replace('/auth');
      } else {
        setUser(user);
        getProfileDetails(user.id);
      }
    }    
    
    checkUser();

  },[router])

  // signing out the user
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (!error){
      console.log('Signed Out')
    }
    router.replace('/');
  }

  async function updateProfile(){
    const { error } = await supabase
    .from('Users')
    .update({
        name,
        organization
    })
    .eq('uid', user!.id) // Will not be null as user only if signed up will be able to view
    
    if (!error){
        alert("Congrats your profile has been updated successfully")
    }
  }

  // Function to change the Password
  async function changePassword(){
    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (!error) {
        alert("Password updated successfully")
        setPassword("");
    } else {
        console.error(error.message)
    }    
  }


  return (
    <div className="p-6 py-5">
      
      {/* Navigation */}
      <div className="flex justify-between items-center print:hidden mb-6 border-b border-gray-100 pb-4">
        <Image
            src="/SBSSLogo.png"
            alt="Loading"
            width={180}
            height={100}
            priority
        />        

          <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1.5 cursor-pointer text-gray-500 hover:text-gray-800 transition" onClick={() => router.replace('/projects')}>
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

        {/* Profile Update Form Submission */}
        <div className="flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Update Profile</h2>
            <div className="w-full max-w-md border border-gray-200 rounded-xl p-6 shadow-sm">


                {!changePasswordFlag && (
                    <>
                        {/* Name */}
                        <div className="mb-4">
                        <label className="text-sm text-black">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>

                        {/* Organization */}
                        <div className="mb-6">
                            <label className="text-sm text-black">Organization</label>
                            <input
                                type="text"
                                value={organization}
                                onChange={e => setOrginization(e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>                    
                    </>
                )}

                {changePasswordFlag && (
                <>
                    {/* Password */}
                    <div className="mb-6">
                    <label className="text-sm text-black">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                </>
                )}

                {/* Buttons */}
                <div className="flex gap-3">

                    {!changePasswordFlag && (
                        <button
                            className="flex-1 bg-blue-600 text-white py-2 rounded-md cursor-pointer hover:bg-blue-700 transition"
                            onClick={updateProfile}
                        >
                            Update Profile
                        </button>
                    )}

                    <button
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md cursor-pointer hover:bg-gray-300 transition"
                        onClick={() => changePasswordFlag ? changePassword() : setChangePasswordFlag(true)}
                    >
                        {changePasswordFlag ? "Update Password": "Change Password"}
                    </button>
                </div>

            </div>
        </div>   

    </div>

  );
}