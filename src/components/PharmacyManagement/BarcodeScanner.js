import React, { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = ({ onScanSuccess }) => {
  useEffect(() => {
    const scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.stop();
      },
      () => {}
    );

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScanSuccess]);

  return <div id="reader" style={{ width: "100%" }} />;
};

export default BarcodeScanner;   // ✅ IMPORTANT