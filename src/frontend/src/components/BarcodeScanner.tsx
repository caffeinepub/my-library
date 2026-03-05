import { CameraOff, Loader2, RefreshCw, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useQRScanner } from "../qr-code/useQRScanner";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const IS_MOBILE =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const {
    qrResults,
    isScanning,
    isSupported,
    error,
    isLoading,
    startScanning,
    stopScanning,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 5,
  });

  // Track already-reported barcodes to avoid duplicate calls
  const reportedRef = useRef<Set<string>>(new Set());
  const hasScannedRef = useRef(false);
  const startScanningRef = useRef(startScanning);
  const stopScanningRef = useRef(stopScanning);

  useEffect(() => {
    startScanningRef.current = startScanning;
    stopScanningRef.current = stopScanning;
  });

  useEffect(() => {
    startScanningRef.current();
    return () => {
      stopScanningRef.current();
    };
  }, []);

  // Handle scan results
  useEffect(() => {
    if (hasScannedRef.current) return;
    if (qrResults.length === 0) return;

    const latest = qrResults[0];
    if (reportedRef.current.has(latest.data)) return;

    reportedRef.current.add(latest.data);
    hasScannedRef.current = true;

    stopScanning().then(() => {
      onScan(latest.data);
    });
  }, [qrResults, stopScanning, onScan]);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex flex-col items-center justify-center w-full h-full max-w-none max-h-none m-0 p-0 border-0 bg-transparent"
      style={{ background: "rgba(5, 5, 12, 0.95)" }}
      aria-label="Barcode scanner"
      data-ocid="scanner.modal"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close scanner"
        data-ocid="scanner.close_button"
        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Camera not supported */}
      {isSupported === false && (
        <div
          className="flex flex-col items-center gap-4 px-8 text-center"
          data-ocid="scanner.error_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center">
            <CameraOff className="w-8 h-8 text-white/60" />
          </div>
          <p className="font-mono text-sm text-white/80">
            Camera not supported on this device
          </p>
          <button
            type="button"
            onClick={handleClose}
            data-ocid="scanner.close_button"
            className="font-mono text-xs px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Error state */}
      {error && isSupported !== false && (
        <div
          className="flex flex-col items-center gap-4 px-8 text-center"
          data-ocid="scanner.error_state"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <CameraOff className="w-8 h-8 text-red-400" />
          </div>
          <p className="font-mono text-sm text-white/80">
            {error.message ?? "Camera access failed"}
          </p>
          <button
            type="button"
            onClick={() => retry()}
            data-ocid="scanner.button"
            className="font-mono text-xs px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none"
          data-ocid="scanner.loading_state"
        >
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="font-mono text-xs text-white/60">Starting camera...</p>
        </div>
      )}

      {/* Camera preview + viewfinder */}
      {isSupported !== false && !error && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Live video feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: isScanning ? 1 : 0.3 }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Dark vignette overlay with cutout */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {/* Top shade */}
            <div className="absolute top-0 left-0 right-0 bottom-[calc(50%+min(35vw,35vh))] bg-black/60" />
            {/* Bottom shade */}
            <div className="absolute top-[calc(50%+min(35vw,35vh))] left-0 right-0 bottom-0 bg-black/60" />
            {/* Left shade */}
            <div
              className="absolute bg-black/60"
              style={{
                top: "calc(50% - min(35vw, 35vh))",
                bottom: "calc(50% - min(35vw, 35vh))",
                left: 0,
                right: "calc(50% + min(35vw, 35vh))",
              }}
            />
            {/* Right shade */}
            <div
              className="absolute bg-black/60"
              style={{
                top: "calc(50% - min(35vw, 35vh))",
                bottom: "calc(50% - min(35vw, 35vh))",
                left: "calc(50% + min(35vw, 35vh))",
                right: 0,
              }}
            />
          </div>

          {/* Viewfinder frame */}
          <div
            className="relative shrink-0"
            style={{
              width: "min(70vw, 70vh)",
              height: "min(70vw, 70vh)",
            }}
          >
            {/* Corner brackets — SVG approach for crisp rendering */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Top-left */}
              <polyline
                points="18,6 6,6 6,18"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Top-right */}
              <polyline
                points="82,6 94,6 94,18"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Bottom-left */}
              <polyline
                points="18,94 6,94 6,82"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Bottom-right */}
              <polyline
                points="82,94 94,94 94,82"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Animated scan line */}
            {isScanning && (
              <div
                className="absolute left-2 right-2 h-0.5 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.7 0.18 60), transparent)",
                  animation: "scanLine 2s ease-in-out infinite",
                }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 pb-16 safe-bottom pointer-events-none">
            <p className="font-mono text-xs text-white/70 tracking-widest uppercase">
              {isScanning
                ? "Scanning for barcode..."
                : "Align barcode in frame"}
            </p>
          </div>

          {/* Switch camera button (mobile only) */}
          {IS_MOBILE && isScanning && (
            <button
              type="button"
              onClick={() => switchCamera()}
              aria-label="Switch camera"
              data-ocid="scanner.toggle"
              className="absolute bottom-20 right-6 z-10 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 pointer-events-auto safe-bottom"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes scanLine {
          0% { top: 8%; }
          50% { top: 88%; }
          100% { top: 8%; }
        }
      `}</style>
    </dialog>
  );
}
