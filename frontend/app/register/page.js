"use client"
import { useState } from "react"
import api from "../../lib/api"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [form, setForm] = useState({ email:"", password:"", name:"", role:"student" })
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post("/auth/register", form)
    router.push("/")
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <input className="border p-2 w-full mb-2" placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <input className="border p-2 w-full mb-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <input type="password" className="border p-2 w-full mb-2" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        <select className="border p-2 w-full mb-2" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
        </select>
        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">Register</button>
      </form>
    </div>
  )
}
