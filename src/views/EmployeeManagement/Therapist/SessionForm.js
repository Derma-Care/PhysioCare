import React, { useState } from "react"
import { updateSession, uploadMedia } from "../../api/therapistApi"
import UploadMedia from "./UploadMedia"

export default function SessionForm({ sessionId }) {

  const [notes, setNotes] = useState("")
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [imageUrl,setImageUrl]=useState("")
const [videoUrl,setVideoUrl]=useState("")

  const handleSubmit = async () => {

    let imageUrl = ""
    let videoUrl = ""

   <UploadMedia onUpload = {setImageUrl} />
<UploadMedia onUpload={setVideoUrl} />

    await updateSession({
      sessionId,
      notes,
      imageUrl,
      videoUrl,
      status: "completed",
    })

    alert("Updated")
  }

  return (
    <div>

      <textarea
        placeholder="Notes"
        onChange={(e) => setNotes(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <input
        type="file"
        onChange={(e) => setVideo(e.target.files[0])}
      />

      <button onClick={handleSubmit}>
        Save Session
      </button>

    </div>
  )
}