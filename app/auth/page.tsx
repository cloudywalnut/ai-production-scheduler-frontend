'use client'

import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/navigation';
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
    if (!error) router.replace("/projects");
  }

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    setLoading(false)
    setSignUpFlag(false)
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 bg-[#1a0a0a] flex-col justify-between p-12">
        
        {/* Logo */}
        <Image src="/layar.png" width={180} height={180} alt="Logo" priority className="rounded-lg" />

        {/* Middle Content */}
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Your complete<br />
            <span className="text-[#9b1c1c]">film production</span><br />
            command center.
          </h1>

          <div className="space-y-5">
            {[
              { title: "Script Breakdown", desc: "Automatically tag and categorize every element in your script." },
              { title: "Production Scheduling", desc: "Build shoot schedules that adapt to your cast and locations." },
              { title: "Team Collaboration", desc: "Keep your entire crew aligned from pre-production to wrap." },
            ].map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#9b1c1c] mt-2 shrink-0" />
                <div>
                  <p className="text-white text-sm font-semibold">{feature.title}</p>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Quote */}
        <p className="text-gray-600 text-xs">
          Trusted by independent filmmakers and production houses worldwide.
        </p>

      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-8 py-12">

        {/* Mobile Logo */}
        <div className="flex md:hidden items-center mb-3">
          <Image src="/layar.png" width={180} height={180} alt="Logo" priority className="rounded-lg" />
        </div>

        <div className="w-full max-w-sm">

          <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center md:text-left">
            {signUpFlag ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-sm text-gray-500 mb-8 text-center md:text-left">
            {signUpFlag ? "Start managing your productions today." : "Sign in to continue to your dashboard."}
          </p>

          <form onSubmit={signUpFlag ? signUp : signIn} className="space-y-4">

            <div>
              <label className="text-sm font-semibold text-gray-800 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 border border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-800 mb-1 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {signUpFlag && (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-800 mb-1 block">Name</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 border border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-800 mb-1 block">Organization</label>
                  <input
                    type="text"
                    placeholder="Your production company"
                    className="w-full px-4 py-2.5 border border-gray-400 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                    value={organization}
                    onChange={e => setOrginization(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 cursor-pointer mt-2"
            >
              {signUpFlag ? (loading ? 'Creating account…' : 'Create Account') : (loading ? 'Signing in…' : 'Sign In')}
            </button>

            <p className="text-sm text-center md:text-left text-gray-500 mt-2">
              {signUpFlag ? 'Already have an account?' : "Don't have an account?"}{' '}
              <span
                className="text-[#9b1c1c] font-semibold cursor-pointer hover:underline"
                onClick={() => setSignUpFlag(!signUpFlag)}
              >
                {signUpFlag ? 'Sign In' : 'Sign Up'}
              </span>
            </p>

          </form>
        </div>
      </div>

    </div>
  )
}