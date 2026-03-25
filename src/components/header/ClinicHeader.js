import { useEffect, useRef, useState } from 'react'

export const ClinicHeader = ({ text }) => {
  const ref = useRef()
  const [fontSize, setFontSize] = useState(24)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const maxLines = 3
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
    const maxHeight = lineHeight * maxLines

    let size = 24
    el.style.fontSize = `${size}px`

    while (el.scrollHeight > maxHeight && size > 12) {
      size -= 1
      el.style.fontSize = `${size}px`
    }
    setFontSize(size)
  }, [text])

  return (
    <div ref={ref} className="clinic-header" style={{ fontSize: `${fontSize}px` }}>
      {text}
    </div>
  )
}
