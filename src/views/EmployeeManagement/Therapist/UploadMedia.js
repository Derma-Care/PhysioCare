import React, { useState } from "react"
import { uploadMedia } from "../../api/therapistApi"

export default function UploadMedia({ onUpload }) {

  const [file, setFile] = useState(null)

  const handleUpload = async () => {

    if (!file) return

    const fd = new FormData()
    fd.append("file", file)

    const res = await uploadMedia(fd)

    onUpload(res.data.url)
  }

  return (
    <div>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload
      </button>

    </div>
  )
}