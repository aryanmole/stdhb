"use client"
import { useState } from "react"
import api from "../lib/api"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post("/auth/login", { email, password })
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.user.role)
      if (res.data.user.role === "faculty") router.push("/faculty")
      else if (res.data.user.role === "admin") router.push("/admin")
      else router.push("/dashboard")
    } catch (err) {
      setError("Invalid credentials")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Student Hub Login</h1>
        {error && <p className="text-red-500">{error}</p>}
        <input className="border p-2 w-full mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="border p-2 w-full mb-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Login</button>
        <p className="text-sm mt-2">No account? <a href="/register" className="text-blue-600">Register</a></p>
      </form>
    </div>
  )
}
