import { pdfjs } from 'react-pdf'

// ✅ This is the Vite-compatible way
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url
).toString()
