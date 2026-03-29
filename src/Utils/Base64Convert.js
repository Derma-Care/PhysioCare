export const convertToBase64 = async (image) => {
  try {
    // ✅ already base64
    if (typeof image === "string" && image.startsWith("data:image")) {
      return image.split(",")[1]
    }

    // ✅ File / Blob
    if (image instanceof File || image instanceof Blob) {
      return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(image)
        reader.onloadend = () => resolve(reader.result.split(",")[1])
        reader.onerror = reject
      })
    }

    // ✅ URL / blob URL
    if (typeof image === "string") {
      const res = await fetch(image)
      const blob = await res.blob()

      return await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => resolve(reader.result.split(",")[1])
        reader.onerror = reject
      })
    }

    return ""
  } catch (err) {
    console.error("Base64 error:", err)
    return ""
  }
}