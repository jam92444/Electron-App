import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import jsQR from "jsqr";

export default function QrScanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const beepRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Preload a short beep sound (Base64-encoded WAV, works offline)
    beepRef.current = new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
    );
  }, []);

  const startScan = async () => {
    if (scanning) return;
    setScanning(true);
    setResults([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      video.play();

      let lastDetected = ""; // prevent duplicate beeps for same QR

      const tick = () => {
        if (!scanning) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );
          const code = jsQR(imageData.data, canvas.width, canvas.height);

          if (code && code.data !== lastDetected) {
            lastDetected = code.data;
            beepRef.current?.play();
            if (navigator.vibrate) navigator.vibrate(150);
            setResults((prev) => [
              { text: code.data, time: new Date().toLocaleTimeString() },
              ...prev,
            ]);

            // Reset lastDetected after 2 seconds to allow re-scan of same QR
            setTimeout(() => {
              lastDetected = "";
            }, 2000);
          }
        }
        requestAnimationFrame(tick);
      };

      tick();
    } catch (err) {
      console.error("Camera access denied:", err);
      setScanning(false);
      alert("Camera access denied or unavailable.");
    }
  };

  const stopScan = () => {
    setScanning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  return (
    <div
      style={{ textAlign: "center" }}
      className="bg-white  min-h-screen flex flex-col items-center p-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 ">
        📷 Offline QR Scanner
      </h2>

      <video
        ref={videoRef}
        style={{
          width: "90%",
          maxWidth: "400px",
          border: "2px solid #333",
          borderRadius: "10px",
          display: scanning ? "block" : "none",
        }}
      />

      <canvas ref={canvasRef} hidden />

      <div className="mt-4 flex gap-4">
        {!scanning ? (
          <button
            onClick={startScan}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Start Scan
          </button>
        ) : (
          <button
            onClick={stopScan}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Stop Scan
          </button>
        )}
      </div>

      <div className="mt-6 w-full max-w-md text-left">
        <h3 className="text-lg font-semibold text-gray-800  mb-2">
          Scanned Results
        </h3>
        {results.length === 0 ? (
          <p className="text-gray-500">
            No QR codes scanned yet.
          </p>
        ) : (
          <ul className="bg-gray-100 p-3 rounded shadow-sm space-y-2">
            {results.map((res, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-800  border-b border-gray-300 pb-1"
              >
                <strong>{res.time}</strong>: {res.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}



export function QrScannerTest() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render((decodedText) => alert(decodedText));
    return () => scanner.clear();
  }, []);
  return <div id="reader" style={{ width: 400 }} />;
}