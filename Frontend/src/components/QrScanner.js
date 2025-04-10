import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "../styles/QrScanner.css"; // 👈 Make sure to create this file

const QrScanner = () => {
  const webcamRef = useRef(null);
  const [confirmation, setConfirmation] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const captureAndSend = async () => {
    setIsScanning(true);
    setConfirmation("⏳ Scanning...");

    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      setConfirmation("❌ Unable to access camera feed.");
      setIsScanning(false);
      return;
    }

    try {
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append("file", blob, "qr_image.png");

      const response = await fetch("http://localhost:8000/scan_qr_image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmation(`✅ ${data.message}`);
      } else {
        // Show different messages based on error
        const errorMsg = data.detail;
        if (errorMsg.includes("Registration not found")) {
          setConfirmation("⚠️ This QR has already been scanned or is invalid.");
        } else if (errorMsg.includes("No QR code detected")) {
          setConfirmation("❌ No QR code found. Please try again.");
        } else {
          setConfirmation("❌ Failed to scan. " + errorMsg);
        }
      }
    } catch (err) {
      setConfirmation("❌ Network error. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="scanner-container">
      <h2>📷 Scan Student QR</h2>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/png"
        width={320}
        height={240}
        className="scanner-webcam"
      />
      <button onClick={captureAndSend} disabled={isScanning}>
        {isScanning ? "Scanning..." : "Scan & Submit"}
      </button>
      <div className={`confirmation ${confirmation.startsWith("✅") ? "success" : "error"}`}>
        {confirmation && <p>{confirmation}</p>}
      </div>
    </div>
  );
};

export default QrScanner;
