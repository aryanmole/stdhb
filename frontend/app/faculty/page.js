"use client"
import { useEffect, useState } from "react"
import api from "../../lib/api"

export default function FacultyPage() {
  const [pending, setPending] = useState([])

  useEffect(()=>{ load() }, [])

  const load = async () => {
    const res = await api.get("/activity/pending")
    setPending(res.data)
  }

  const approve = async (id) => {
    await api.post(`/activity/${id}/approve`, { comment: "Looks good" })
    load()
  }
  const reject = async (id) => {
    await api.post(`/activity/${id}/reject`, { comment: "Not valid" })
    load()
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Pending Activities</h1>
      {pending.map(a=>(
        <div key={a._id} className="bg-white p-4 rounded shadow mb-3">
          <h2 className="font-semibold">{a.title}</h2>
          <p>{a.description}</p>
          <p>By: {a.student?.name} ({a.student?.email})</p>
          <button onClick={()=>approve(a._id)} className="bg-green-600 text-white px-3 py-1 rounded mr-2">Approve</button>
          <button onClick={()=>reject(a._id)} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
        </div>
      ))}
    </div>
  )
}
