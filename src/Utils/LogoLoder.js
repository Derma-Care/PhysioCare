import logo from '../assets/images/DermaCare.png'
import { motion } from 'framer-motion'
export const LogoLoader = () => {
  const data = JSON.parse(sessionStorage.getItem('selectedHospital') || '{}')
  const hospitalData = data.data;
  console.log(hospitalData, 'hospitalData')
  console.log(data, 'data')
  const hospitalName = hospitalData?.name || hospitalData?.clinicName || "CCMS"
  const hospitalLogo = hospitalData?.hospitalLogo
    ? `data:image/webp;base64,${hospitalData.hospitalLogo}`
    : logo
  return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
      <motion.img
        src={hospitalLogo}
        alt="logo"
        style={{ width: 90 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.6, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1,
        }}
      />
    </div>
  )
}
