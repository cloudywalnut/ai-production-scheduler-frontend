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
  const [passwordError, setPasswordError] = useState<string>("");

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
    if (!user) return;
    const { error } = await supabase
    .from('Users')
    .update({
        name,
        organization
    })
    .eq('uid', user.id)

    if (!error){
        alert("Congrats your profile has been updated successfully")
    } else {
        console.error(error);
        alert("Sorry, we couldn't update your profile. Please try again.")
    }
  }

  // Function to change the Password
  async function changePassword(){
    if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters long")
        return
    }
    setPasswordError("")

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
            src="/Script_Breakdown_LightBG.png"
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
            <div className="w-full max-w-md border border-gray-200 rounded-xl shadow-sm overflow-hidden">

                {/* Header */}
                <div className="bg-linear-to-r from-[#1a0a0a] to-black px-6 py-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#9b1c1c] flex items-center justify-center text-white text-2xl font-bold mb-3">
                        {name ? name.charAt(0).toUpperCase() : <UserIcon className="w-8 h-8" />}
                    </div>
                    <h2 className="text-lg font-semibold text-white">{name || "Your Profile"}</h2>
                    {user?.email && <p className="text-sm text-gray-400 mt-0.5">{user.email}</p>}
                </div>

                <div className="p-6">

                    {!changePasswordFlag && (
                        <>
                            {/* Name */}
                            <div className="mb-4">
                            <label className="text-sm text-black">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                            />
                            </div>

                            {/* Organization */}
                            <div className="mb-6">
                                <label className="text-sm text-black">Organization</label>
                                <input
                                    type="text"
                                    value={organization}
                                    onChange={e => setOrginization(e.target.value)}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                                />
                            </div>
                        </>
                    )}

                    {changePasswordFlag && (
                    <>
                        {/* Password */}
                        <div className="mb-2">
                        <label className="text-sm text-black">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setPasswordError(""); }}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                        />
                        {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
                        </div>
                        <button
                            type="button"
                            className="block text-xs text-gray-400 hover:text-[#9b1c1c] transition mb-4 cursor-pointer"
                            onClick={() => { setChangePasswordFlag(false); setPassword(""); setPasswordError(""); }}
                        >
                            ← Back to Profile
                        </button>
                    </>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">

                        {!changePasswordFlag && (
                            <button
                                className="flex-1 bg-black text-white py-2 rounded-md cursor-pointer hover:bg-gray-800 transition"
                                onClick={updateProfile}
                            >
                                Update Profile
                            </button>
                        )}

                        <button
                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md cursor-pointer hover:bg-gray-200 transition"
                            onClick={() => changePasswordFlag ? changePassword() : setChangePasswordFlag(true)}
                        >
                            {changePasswordFlag ? "Update Password": "Change Password"}
                        </button>
                    </div>

                </div>
            </div>
        </div>

    </div>

  );
}