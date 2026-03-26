/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
import React, { useState, useRef } from 'react'
import front from '../../assets/body_front.png'
import back from '../../assets/body_back.png'
import BodySvg from './BodySvg'
import QuestionModal from './QuestionModal'
import html2canvas from 'html2canvas'
import { Spinner } from 'react-bootstrap'
import LoadingIndicator from '../../Utils/loader'
import { showCustomToast } from '../../Utils/Toaster'
export default function BodyAssessment({ onPartClick }) {
  const [view, setView] = useState('front')
  const [selected, setSelected] = useState([])
  const [modalPart, setModalPart] = useState(null)
  const [answerData, setAnswerData] = useState([])
  const [points, setPoints] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef()
  const [modalQueue, setModalQueue] = useState([])
const [currentPart, setCurrentPart] = useState(null)
const [finalImage, setFinalImage] = useState(null)
  const svgRef = useRef()
const handleClick = (id, event) => {
  const svg = svgRef.current
  const rect = svg.getBoundingClientRect()

  const px = (event.clientX - rect.left) / rect.width
const py = (event.clientY - rect.top) / rect.height

let x = px * 600
let y = py * 600

// fix for left / right body split
if (px > 0.5) {
  // right side (back body)
  x = 300 + (px - 0.5) * 600
} else {
  // left side (front body)
  x = px * 600
}

  if (selected.includes(id)) {
    setSelected((prev) => prev.filter((p) => p !== id))
    setPoints((prev) => prev.filter((p) => p.id !== id))
  } else {
    setSelected((prev) => [...prev, id])
    setPoints((prev) => [...prev, { id, x, y }])
  }
}

  const getColor = () => 'transparent'

  // SEND IMAGE + IDS
  const sendImage = () => {
    const svg = svgRef.current

    const data = new XMLSerializer().serializeToString(svg)

    const base64 = 'data:image/svg+xml;base64,' + btoa(data)

    fetch('/api/savePart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parts: selected,
        image: base64,
      }),
    })
  }

const handleSaveAnswers = (data) => {

  const newAnswers = [...answerData, data];

  const selectedParts = [...selected];

  setAnswerData(newAnswers);
  setModalPart(null);
  setSelected([]);

  if (onPartClick) {
    onPartClick({
      parts: selectedParts,
      image: finalImage,
      answerData: newAnswers,
    });
  }
};

  console.log(answerData)
  // ✅ SEND TO PARENT
 const sendToParent = async () => {
    if (selected.length === 0) {
    showCustomToast("Please select at least one body part");
    return;
  }
  setLoading(true)

  const canvas = document.createElement("canvas")
  canvas.width = 600
  canvas.height = 600

  const ctx = canvas.getContext("2d")

  const frontImg = new Image()
  const backImg = new Image()

  frontImg.src = front
  backImg.src = back

  frontImg.onload = () => {
    ctx.drawImage(frontImg, 0, 0, 300, 550)

    backImg.onload = () => {
      ctx.drawImage(backImg, 300, 0, 300, 600)

      // draw dots
      points.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fillStyle = "red"
        ctx.fill()
      })

      const base64 = canvas.toDataURL("image/png")

      setPreviewImage(base64)
       setFinalImage(base64);
      setModalPart(selected)

      setLoading(false)
handleClear()
      // if (onPartClick) {
      //   onPartClick({
      //     parts: selected,
      //     image: base64,
      //     answerData: answerData
      //   })
      // }
    }
  }
}
const handleClear = () => {
  setSelected([])
  setPoints([])
}
  return (
    <>
    <div>
      {/* TOGGLE */}
      {/* <button className="btn btn-primary gap-5 mx-2" onClick={() => setView('front')}>Front</button>
      <button className='btn btn-success' onClick={() => setView('back')}>Back</button> */}
      {/* SVG + IMAGE */}
     <svg
  ref={svgRef}
  viewBox="0 0 600 600"
  width="600"
  height="600"
>
 <image href={front} x="0" y="0" width="300" height="550" />
  <image href={back} x="300" y="0" width="300" height="600" />

{points.map((p, i) => (
  <circle
    key={i}
    cx={p.x}
    cy={p.y}
    r="3"
    className="dot"
  />
))}

  <BodySvg
    view={view}
    onClickPart={handleClick}
    getColor={getColor}
  />
</svg>
     <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  }}
>

  <div>
    <b>Selected:</b> {selected.join(", ")}
  </div>
<div >
  <button
    className="btn btn-danger mx-2"
    onClick={handleClear}
  >
    Clear
  </button>

  <button
    className="btn btn-primary"
    onClick={sendToParent}
  >
    {!loading ? (
      "Done"
    ) : (
      <div>
        <Spinner size="sm" /> Generating...
      </div>
    )}
  </button>
</div>
</div>
      {/* {previewImage && (
        <div>
          <h4>Generated Image</h4>
         
          <img src={previewImage}  alt="preview" />
        </div>
      )} */}
      {modalPart && (
  <QuestionModal
    visible={true}
    partId={modalPart}
    onClose={() => setModalPart(null)}
    onSave={handleSaveAnswers}
  />
)}
    </div>
  <style>{`
.dot {
  fill: red;
  transform-box: fill-box;
  transform-origin: center;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
`}</style>
    </>
  )
}
