"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamOn, setStreamOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roastText, setRoastText] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreamOn(true);
        }
      } catch {
        setError("Camera permission denied or unavailable.");
      }
    };
    start();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const captureAndRoast = async () => {
    try {
      setError(null);
      setLoading(true);
      setRoastText("");
      setAudioUrl(null);

      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      const targetWidth = 640;
      const ratio = video.videoHeight ? video.videoWidth / video.videoHeight : 1.7778;
      const w = targetWidth;
      const h = Math.round(targetWidth / ratio);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Request failed");
      }
      const json = (await res.json()) as { text: string; audioBase64: string };
      setRoastText(json.text);
      const url = `data:audio/mpeg;base64,${json.audioBase64}`;
      setAudioUrl(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Roast Me (PG-13)</h1>
      <p className="text-sm text-zinc-600">
        Allow camera access, capture a frame, generate a playful roast, and hear it aloud.
      </p>

      <div className="flex flex-col items-center gap-3">
        <video ref={videoRef} className="rounded-md border" playsInline muted autoPlay />
        <canvas ref={canvasRef} className="hidden" />
        <button
          onClick={captureAndRoast}
          disabled={!streamOn || loading}
          className="rounded-full bg-black px-5 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Roasting..." : "Roast me"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {roastText && (
        <div className="max-w-xl rounded-lg border p-4">
          <p className="text-base">{roastText}</p>
        </div>
      )}
      {audioUrl && (
        <audio src={audioUrl} controls autoPlay className="w-full max-w-xl" />
      )}
    </main>
  );
}
