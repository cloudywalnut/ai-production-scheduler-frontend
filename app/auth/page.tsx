'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/navigation'; // App Router
import Image from 'next/image';

export default function AuthPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [organization, setOrginization] = useState('')
  const router = useRouter();

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signUpFlag, setSignUpFlag] = useState(false)

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) setError(error.message)
    setLoading(false)

    // If there is no error means successful signIn then go to dashboard
    if (!error) router.replace("/projects");
}

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) setError(error.message)
    setLoading(false)
    setSignUpFlag(false)
  }



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">

      {/* Image on top */}
      <Image
        src="/layar.png"
        width={240}
        height={240}
        alt="Logo"
        className="mb-4"
        priority
      />

      <div className="bg-white w-[360px] p-6 rounded-2xl shadow-lg">

        <h1 className="text-2xl font-semibold text-center mb-6">
          {signUpFlag ? "Sign Up" : "Sign In "}
        </h1>

        <form onSubmit={signUpFlag ? signUp : signIn} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {signUpFlag && (
            <>

              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Organization"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                value={organization}
                onChange={e => setOrginization(e.target.value)}
                required
              />

            </>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer"
          >
            {signUpFlag ? loading ? 'Signing Up…' : 'Sign Up' : loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-sm text-black-500 underline text-center cursor-pointer"
          onClick={() => setSignUpFlag(!signUpFlag)}
          >
            {signUpFlag ? 'Sign In' : 'Sign Up Now'}
          </p>

        </form>
      </div>

    </div>
  )
}
