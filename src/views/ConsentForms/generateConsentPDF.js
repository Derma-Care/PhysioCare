import jsPDF from 'jspdf'

export const generateConsentPDF = async (data, appointment, doctor, selectedHospital) => {
  const doc = new jsPDF()
  let y = 20

  // 🏥 Add Hospital Logo
  if (selectedHospital?.data?.hospitalLogo) {
    const logo = selectedHospital.data.hospitalLogo

    if (logo.startsWith('data:')) {
      // Already a Base64 data URL
      doc.addImage(logo, 'JPEG', 10, 10, 30, 30) // Logo on the left
    } else if (logo.startsWith('http')) {
      // Logo is a URL - need to convert it to Base64 before adding to jsPDF
      fetch(logo)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64data = reader.result
            doc.addImage(base64data, 'JPEG', 10, 10, 30, 30) // Logo on the left

            // Hospital name and branch on the right
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            doc.text(selectedHospital?.data?.hospitalName || 'Hospital Name', 200, 15, {
              align: 'right',
            })
            doc.setFontSize(11)
            doc.text(`Branch: ${appointment?.branchname || 'Kokapet'}`, 200, 22, {
              align: 'right',
            })

            doc.save('consent.pdf')
          }
          reader.readAsDataURL(blob)
        })
        .catch((err) => {
          console.error('Error loading logo:', err)
        })
      return
    } else {
      // Treat as Base64 string
      doc.addImage(`data:image/jpeg;base64,${logo}`, 'JPEG', 10, 10, 30, 30) // Logo on the left
    }
  }

  // 🏥 Clinic Header (name and branch on right)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(selectedHospital?.data?.hospitalName || 'Pragna Advanced Skin Care Clinic', 200, 15, {
    align: 'right',
  })
  doc.setFontSize(11)
  doc.text(`Branch: ${appointment?.branchname || 'Kokapet'}`, 200, 22, {
    align: 'right',
  })

  y = 40
  doc.setDrawColor(0)
  doc.line(10, y, 200, y)
  y += 10

  // 📄 Title
  doc.setFontSize(13)

  const subServiceName = appointment?.subServiceName || 'Procedure'
  const fullText = `Consent for ${subServiceName} Procedure`

  // Measure text width
  const textWidth = doc.getTextWidth(fullText)
  const pageCenter = 105 // A4 width is 210mm
  const startX = pageCenter - textWidth / 2

  // Draw centered text
  doc.text(fullText, startX, y)

  y += 10 // move down for next section

  // 👨‍⚕️ Doctor Info
  doc.setFont('helvetica', 'bold')
  doc.text('Doctor Information', 10, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Name: ${doctor?.doctorName || 'N/A'}`, 10, y)
  y += 6
  doc.text(`Specialization: ${doctor?.specialization || 'N/A'}`, 10, y)
  y += 6
  doc.text(`License No: ${doctor?.doctorLicence || 'N/A'}`, 10, y)
  y += 10

  // 👩 Patient Info
  doc.setFont('helvetica', 'bold')
  doc.text('Patient Information', 10, y)
  doc.setFont('helvetica', 'normal')
  y += 6
  doc.text(`Name: ${appointment?.name || 'N/A'}`, 10, y)
  y += 6
  doc.text(`Mobile: ${appointment?.mobileNumber || 'N/A'}`, 10, y)
  y += 6
  doc.text(`Gender: ${appointment?.gender || 'N/A'}`, 10, y)
  y += 6
  doc.text(`Age: ${appointment?.age || 'N/A'} Yrs`, 10, y)
  y += 6

  // 📅 Current Date
 const today = new Date();
const formattedDate = today.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}); // e.g., "24 Sep 2025"

doc.text(`Procedure Date: ${formattedDate}`, 10, y);

  y += 10

  // 📋 General Consent Points
  doc.setFont('helvetica', 'bold')
  doc.text('General Consent Points:', 10, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  const generalConsentPoints = [
    'I consent to the procedure',
    'I consent to the use of my data',
    'I agree to receive follow-up communications',
  ]
  generalConsentPoints.forEach((point) => {
    const lines = doc.splitTextToSize(point, 180)
    doc.text(lines, 12, y)
    y += lines.length * 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  })
  y += 10

  // 📋 Additional Consent Sections from backend
  data[0]?.consentFormQuestions?.forEach((section) => {
    doc.setFont('helvetica', 'bold')
    doc.text(section.heading, 10, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    section.questionsAndAnswers.forEach((q) => {
      const lines = doc.splitTextToSize(`• ${q.question} `, 180)
      doc.text(lines, 12, y)
      y += lines.length * 6
      if (y > 270) {
        doc.addPage()
        y = 20
      }
    })
    y += 4
  })
  // Add consent titles and texts before consentText array
  doc.setFont('helvetica', 'bold')
  doc.text('I consent to the procedure', 10, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  let procedureText =
    'I hereby provide my informed consent to undergo the procedure and acknowledge that I have understood the associated pre-procedure, procedure, and post-procedure care and guidelines and the corresponding possible reactions and risks.'
  let lines = doc.splitTextToSize(procedureText, 180)
  doc.text(lines, 10, y)
  y += lines.length * 6
  if (y > 270) {
    doc.addPage()
    y = 20
  }

  doc.setFont('helvetica', 'bold')
  doc.text('I consent to the use of my data', 10, y)
  y += 6

  // 📄 Consent Statements
  const consentText = [
    `I, ${appointment?.name || 'N/A'}, hereby give my voluntary and informed consent for the collection, storage, and use of my medical records, personal health information, and diagnostic images for purposes including research, education, training, and improving medical services.`,
    'I understand that all information will be handled in accordance with applicable privacy laws and regulations, and that my identity will be protected unless I provide separate written authorization.',
    'I acknowledge that participation is voluntary and that I may withdraw my consent at any time without affecting the medical care I receive.',
  ]
  consentText.forEach((para) => {
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(para, 180)
    doc.text(lines, 10, y)
    y += lines.length * 6
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  })
  y += 10

  // Signatures labels
   // Signature labels
doc.setFontSize(15);
doc.text('Doctor Signature', 10, y);
doc.text('Patient Signature', 150, y);

y += 1; // small gap between labels and signature area

// Doctor signature image
const doctorSignature = doctor?.doctorSignature;
if (doctorSignature) {
  try {
    const sigBase64 = doctorSignature.startsWith('data:')
      ? doctorSignature
      : `data:image/jpeg;base64,${doctorSignature}`;
    const typeMatch = sigBase64.match(/^data:image\/(png|jpeg|jpg);base64,/);
    const type = typeMatch ? typeMatch[1].toUpperCase() : 'JPEG';
    doc.addImage(sigBase64, type, 10, y, 50, 25); // neatly below label
  } catch (error) {
    console.error('Error adding doctor signature:', error);
  }
}

y += 30; // space below signature image

// Divider line
doc.setDrawColor(0); // black
doc.line(10, y, 200, y);

y += 5; // spacing before disclaimer

// Disclaimer
doc.setFontSize(10);
const disclaimer = 'This consent form is digitally generated and valid with a physical signature.';
const disclaimerWidth = doc.getTextWidth(disclaimer);
const centerX = 105 - disclaimerWidth / 2;
doc.text(disclaimer, centerX, y);
  return doc
}
