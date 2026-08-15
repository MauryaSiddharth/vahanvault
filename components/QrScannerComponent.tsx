'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QrScannerComponent({ onScanSuccess }: QrScannerProps) {
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const qrRegionId = "qr-reader-region";
    let isMounted = true;
    let localScanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        // Enforce delay to make sure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 300));
        if (!isMounted) return;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          if (isMounted) {
            setHasCamera(false);
            setErrorMsg("No cameras found on your device.");
          }
          return;
        }

        if (isMounted) {
          setHasCamera(true);
        }

        const html5QrCode = new Html5Qrcode(qrRegionId);
        localScanner = html5QrCode;
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            if (isMounted) {
              onScanSuccess(decodedText);
            }
          },
          () => {
            // Ignore normal scanning error logs to avoid console pollution
          }
        );
      } catch (err: any) {
        console.error("Failed to start scanner:", err);
        if (isMounted) {
          // If already running or permission issue, display user friendly feedback
          if (err.toString().includes("is already scanning")) {
            return;
          }
          setErrorMsg(err.message || "Failed to access camera.");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (localScanner && localScanner.isScanning) {
        localScanner.stop().catch(err => {
          console.error("Failed to stop scanner on unmount:", err);
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div id="qr-reader-region" className="w-full h-full min-h-[300px] bg-black rounded-lg overflow-hidden" />
      
      {hasCamera === false && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-10">
          <span className="text-4xl mb-3">📷</span>
          <p className="text-slate-200 text-sm font-semibold">Camera Access Denied or Missing</p>
          <p className="text-slate-400 text-xs mt-1 max-w-[250px]">Please enable camera permissions or enter the vehicle ID manually below.</p>
        </div>
      )}

      {errorMsg && hasCamera !== false && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center z-10">
          <span className="text-4xl mb-3">⚠️</span>
          <p className="text-slate-200 text-sm font-semibold">Scanner Error</p>
          <p className="text-slate-400 text-xs mt-1 max-w-[250px]">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
