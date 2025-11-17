"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

      if (!videoRef.current) return;

      const video = videoRef.current;
      // Use an offscreen canvas (no DOM element styling needed)
      const canvas = document.createElement("canvas");

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
    <main className="page">
      <div className="container">
        <Card>
          <CardHeader className="stack-sm text-center">
            <h1 className="h1">Roast Cam</h1>
            <p className="muted">Allow camera access, capture a frame, get a concise PG‑13 roast, and hear it aloud.</p>
          </CardHeader>
          <CardContent className="stack-md stack-center">
            <video ref={videoRef} className="video" playsInline muted autoPlay />
            <Button onClick={captureAndRoast} disabled={!streamOn || loading}>
              {loading ? "Roasting..." : "Roast me"}
            </Button>
            {error && <p>{error}</p>}
            {roastText && (
              <div>
                <p>{roastText}</p>
              </div>
            )}
            {audioUrl && <audio src={audioUrl} controls autoPlay />}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
