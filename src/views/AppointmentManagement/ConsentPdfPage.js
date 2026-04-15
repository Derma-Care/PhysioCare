/* eslint-disable prettier/prettier */
import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";



import PrintLetterHead from "../../Utils/PrintLetterHead";

const ConsentPdfPage = ({ booking, vitals, onSubmitPdf }) => {
    const pdfRef = useRef();

    const patientSignRef = useRef();
    const consentSignRef = useRef();

    const [patientSigned, setPatientSigned] = useState(false);
    const [consentSigned, setConsentSigned] = useState(false);
    const [loading, setLoading] = useState(false);

    const clearPatientSign = () => {
        patientSignRef.current.clear();
        setPatientSigned(false);
    };

    const clearConsentSign = () => {
        consentSignRef.current.clear();
        setConsentSigned(false);
    };

    const generatePdf = async () => {
        try {
            setLoading(true);

            const canvas = await html2canvas(pdfRef.current, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");

            const pdfWidth = 210;
            const pdfHeight = 297;

            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const blob = pdf.output("blob");

            pdf.save("ConsentForm.pdf");

            const reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = () => {
                const base64 = reader.result;
                onSubmitPdf(base64); // send to api
            };
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = () => {
            const base64 = reader.result;
            onSubmitPdf(base64);
        };
    };

    return (
        <div>
            {/* ACTION BUTTONS */}
            <div className="mb-3 no-print">
                <button
                    className="btn btn-success me-2"
                    disabled={!patientSigned || !consentSigned || loading}
                    onClick={generatePdf}
                >
                    {loading ? "Generating..." : "Submit & Download PDF"}
                </button>

                <input type="file" accept="application/pdf" onChange={handleUpload} />
            </div>

            {/* PDF CONTENT */}
            <div ref={pdfRef} id="pdf-content">
                {/* PAGE 1 */}
                <div className="page-break">
                    <PrintLetterHead>
                        <PatientRegistration booking={booking} vitals={vitals} />

                        <div className="mt-4">
                            <h5>Patient Signature</h5>

                            <SignatureCanvas
                                penColor="black"
                                canvasProps={{
                                    width: 500,
                                    height: 150,
                                    className: "border",
                                }}
                                ref={patientSignRef}
                                onEnd={() => setPatientSigned(true)}
                            />

                            <button
                                className="btn btn-sm btn-danger mt-2"
                                onClick={clearPatientSign}
                            >
                                Clear
                            </button>
                        </div>
                    </PrintLetterHead>
                </div>

                {/* PAGE 2 */}
                <div className="page-break">
                    <PrintLetterHead>
                        <h3 className="text-center">Consent Form</h3>

                        <p>
                            I voluntarily agree to receive physiotherapy treatment and I
                            understand benefits, risks, and responsibilities.
                        </p>

                        <p>
                            I allow therapist to perform assessment, exercise therapy,
                            modalities, rehabilitation procedures.
                        </p>

                        <div className="mt-5">
                            <h5>Consent Signature</h5>

                            <SignatureCanvas
                                penColor="black"
                                canvasProps={{
                                    width: 500,
                                    height: 150,
                                    className: "border",
                                }}
                                ref={consentSignRef}
                                onEnd={() => setConsentSigned(true)}
                            />

                            <button
                                className="btn btn-sm btn-danger mt-2"
                                onClick={clearConsentSign}
                            >
                                Clear
                            </button>
                        </div>
                    </PrintLetterHead>
                </div>
            </div>

            <style>{`
        .border{
          border:1px solid #000;
        }

        .page-break{
          page-break-after: always;
          margin-bottom:30px;
        }

        @media print{
          .no-print{
            display:none;
          }

          .page-break{
            page-break-after: always;
          }
        }
      `}</style>
        </div>
    );
};

export default ConsentPdfPage;