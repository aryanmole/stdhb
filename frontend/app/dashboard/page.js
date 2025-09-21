"use client"
import { useEffect, useState } from "react"
import api from "../../lib/api"

export default function Dashboard() {
  const [activities, setActivities] = useState([])
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [file, setFile] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const res = await api.get("/activity/mine")
    setActivities(res.data)
  }

  const submitActivity = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", desc)
    if (file) formData.append("attachments", file)
    await api.post("/activity/submit", formData, { headers: { "Content-Type": "multipart/form-data" }})
    setTitle(""); setDesc(""); setFile(null)
    fetchData()
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Activities</h1>
      <form onSubmit={submitActivity} className="bg-white p-4 rounded shadow mb-6">
        <input className="border p-2 w-full mb-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="border p-2 w-full mb-2" placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <input type="file" onChange={e=>setFile(e.target.files[0])} className="mb-2" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
      </form>

      {activities.map(a=>(
        <div key={a._id} className="bg-white p-3 rounded shadow mb-2">
          <h2 className="font-semibold">{a.title}</h2>
          <p>{a.description}</p>
          <p>Status: <span className="font-bold">{a.status}</span></p>
        </div>
      ))}
    </div>
  )
}
