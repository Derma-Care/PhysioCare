/* eslint-disable react/prop-types */
import React, { useState, useRef } from 'react'
import front from '../../assets/body_front.png'
import back from '../../assets/body_back.png'
import BodySvg from './BodySvg'
import QuestionModal from './QuestionModal'
import html2canvas from 'html2canvas'
import { Spinner } from 'react-bootstrap'
import LoadingIndicator from '../../Utils/loader'
export default function BodyAssessment({ onPartClick }) {
  const [view, setView] = useState('front')
  const [selected, setSelected] = useState([])
  const [modalPart, setModalPart] = useState([])
  const [answerData, setAnswerData] = useState([])
  const [points, setPoints] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [loading, setLoading] = useState(false)
const containerRef = useRef()
  const svgRef = useRef()
const handleClick = (id, event) => {
  const svg = svgRef.current

  const pt = svg.createSVGPoint()
  pt.x = event.clientX
  pt.y = event.clientY

  const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse())

  const x = svgPoint.x
  const y = svgPoint.y

  // if already selected → remove
  if (selected.includes(id)) {
    setSelected((prev) => prev.filter((p) => p !== id))

    // remove dot also
    setPoints((prev) => prev.filter((p) => p.id !== id))

  } else {
    // add new
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
    setAnswerData((prev) => [...prev, data])

    setModalPart(null)
  }
  // ✅ SEND TO PARENT
const sendToParent = async () => {
  setLoading(true)

  const canvas = await html2canvas(containerRef.current, {
    logging: false,
    useCORS: true,
    backgroundColor: null,
  })

  const base64 = canvas.toDataURL("image/png")

  setPreviewImage(base64)

  setModalPart(selected)

  setLoading(false)

  if (onPartClick) {
    onPartClick({
      parts: selected,
      image: base64,
    })
  }
}

  return (
    <div ref={containerRef}>
      {/* TOGGLE */}
      {/* <button className="btn btn-primary gap-5 mx-2" onClick={() => setView('front')}>Front</button>
      <button className='btn btn-success' onClick={() => setView('back')}>Back</button> */}
      {/* SVG + IMAGE */}
      <svg ref={svgRef} viewBox="0 0 300 600" width="800" height="600">
        <image href={front} x="-20" y="0" width="250" height="600" />
        <image href={back} x="260" y="0" width="250" height="600" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="6" fill="red" />
        ))}
        <BodySvg view={view} onClickPart={handleClick} getColor={getColor} />
      </svg>
      <br />
      Selected: {selected.join(', ')}
      <br />
      <button className='btn btn-primary' onClick={sendToParent}>{!loading ? "Done": <LoadingIndicator message='Generating Image ...' />}</button>
      {previewImage && (
  <div>
    <h4>Generated Image</h4>
    <img
      src={previewImage}
      width={400}
      alt="preview"
    />
  </div>
)}
      {modalPart.length > 0 && (
        <QuestionModal
          partId={modalPart}
          onClose={() => setModalPart(null)}
          onSave={handleSaveAnswers}
        />
      )}
    </div>
  )
}
