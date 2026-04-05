import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BarcodeScannerModal({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const scanner = new Html5QrcodeScanner(
          'barcode-scanner-container',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            facingMode: 'environment',
            rememberLastUsedCamera: true,
            supportedScanTypes: ['QR_CODE', 'CODABAR', 'CODE_128', 'CODE_39', 'CODE_93', 'EAN_13', 'EAN_8', 'ITF', 'UPC_A', 'UPC_E'],
          },
          true
        );

        scanner.render(
          (decodedText) => {
            onScan(decodedText);
            scanner.clear();
          },
          (error) => {
            if (!error.includes('NotFoundException')) {
              setError('Scanner error: ' + error);
            }
          }
        );

        scannerRef.current = scanner;
        setIsInitialized(true);
      } catch (err) {
        setError('Failed to initialize scanner: ' + err.message);
      }
    };

    initializeScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
    }
    onClose();
  };

  if (!isInitialized) {
    return (
      <div className="p-6 text-center">
        <Camera className="w-10 h-10 text-slate-400 mx-auto mb-3 animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 text-sm">Initializing camera...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div id="barcode-scanner-container" className="w-full rounded-xl overflow-hidden bg-black"></div>
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-3">
        Point camera at a QR code or barcode
      </p>
      <button onClick={handleClose} className="btn-secondary w-full mt-4 justify-center">
        <X className="w-4 h-4" /> Cancel
      </button>
    </div>
  );
}
