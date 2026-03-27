import React, { useState, useEffect } from "react"
import {
  CModal,
  CModalHeader,
  CModalBody,
  CButton,
  CFormInput,
  CFormTextarea,
} from "@coreui/react"

export default function SessionModal({
  visible,
  data,
  onClose,
  onSave,
}) {

  const [notes, setNotes] = useState("")
  const [beforeImg, setBeforeImg] = useState(null)
  const [afterImg, setAfterImg] = useState(null)
  const [beforeVideo, setBeforeVideo] = useState(null)
  const [afterVideo, setAfterVideo] = useState(null)

  useEffect(() => {

    if (data) {
      setNotes(data.therapistNotes || "")
    }

  }, [data])


  const save = () => {

    const now = new Date()

    const updated = {

      ...data,

      status: "completed",

      therapistNotes: notes,

      beforeImage:
        beforeImg
          ? URL.createObjectURL(beforeImg)
          : data.beforeImage,

      afterImage:
        afterImg
          ? URL.createObjectURL(afterImg)
          : data.afterImage,

      beforeVideo:
        beforeVideo
          ? URL.createObjectURL(beforeVideo)
          : data.beforeVideo,

      afterVideo:
        afterVideo
          ? URL.createObjectURL(afterVideo)
          : data.afterVideo,

      completedTime:
        now.toLocaleTimeString(),

      completedDate:
        now.toLocaleDateString(),

    }

    onSave(updated)

    onClose()

  }


  if (!data) return null


  return (

    <CModal visible={visible} onClose={onClose} size="lg">

      <CModalHeader>

        Session Details

      </CModalHeader>

      <CModalBody>

        <b>Patient:</b> {data.patientName}
        <br />

        <b>Disease:</b> {data.disease}
        <br />

        <b>Therapy:</b> {data.therapy}
        <br />

        <b>Date:</b> {data.date}
        <br />

        <b>Time:</b> {data.completedTime || "-"}

        <hr />

        <b>Doctor Notes:</b>
        <br />
        {data.doctorNotes}

        <hr />

        Therapist Notes

        <CFormTextarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
        />

        <hr />

        Before Image
        <br />

        {data.beforeImage && (
          <img
            src={data.beforeImage}
            width={100}
          />
        )}

        <CFormInput
          type="file"
          onChange={(e) =>
            setBeforeImg(e.target.files[0])
          }
        />

        <hr />

        After Image

        {data.afterImage && (
          <img
            src={data.afterImage}
            width={100}
          />
        )}

        <CFormInput
          type="file"
          onChange={(e) =>
            setAfterImg(e.target.files[0])
          }
        />

        <hr />

        Before Video

        {data.beforeVideo && (
          <video
            src={data.beforeVideo}
            width={150}
            controls
          />
        )}

        <CFormInput
          type="file"
          onChange={(e) =>
            setBeforeVideo(e.target.files[0])
          }
        />

        <hr />

        After Video

        {data.afterVideo && (
          <video
            src={data.afterVideo}
            width={150}
            controls
          />
        )}

        <CFormInput
          type="file"
          onChange={(e) =>
            setAfterVideo(e.target.files[0])
          }
        />

        <CButton
          className="mt-3"
          onClick={save}
        >
          Save
        </CButton>

      </CModalBody>

    </CModal>

  )

}