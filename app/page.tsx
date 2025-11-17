"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Github, Globe, Flame } from "lucide-react";
import Link from "next/link";

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

  const handleKeyDownLink: React.KeyboardEventHandler<HTMLAnchorElement> = (event) => {
    if (event.key !== " ") return;
    event.preventDefault();
    event.currentTarget.click();
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
            <Button
              onClick={captureAndRoast}
              disabled={!streamOn || loading}
              aria-label="Roast me"
              className="group relative inline-flex items-center gap-6 overflow-hidden bg-pink-600 hover:bg-pink-700 text-white shadow-2xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] focus-visible:ring-[4px] focus-visible:ring-ring/50 active:scale-95 px-14 py-7 rounded-3xl text-3xl md:text-4xl leading-none min-w-[22rem]"
            >
              <Flame className="size-10 md:size-12" aria-hidden="true" />
              <span className="font-semibold tracking-wide">
                {loading ? "Roasting..." : "Roast me"}
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0"
              />
            </Button>
            {error && <p>{error}</p>}
            {roastText && (
              <div>
                <p>{roastText}</p>
              </div>
            )}
            {audioUrl && <audio src={audioUrl} controls autoPlay />}

            {/* Social / External Links
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="https://enk.icu"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit my website at enk.icu"
                tabIndex={0}
                onKeyDown={handleKeyDownLink}
                className="inline-flex h-8 items-center gap-2 rounded-md border bg-background px-3 text-sm shadow-xs hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
              >
                <Globe className="size-4" aria-hidden="true" />
                <span>enk.icu</span>
              </Link>
            </div> */}
          </CardContent>
        </Card>
        <footer className="mt-2 flex justify-center">
          <Link
            href="https://github.com/enkhbold470/roast-me"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on GitHub"
            tabIndex={0}
            onKeyDown={handleKeyDownLink}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Github className="size-3" aria-hidden="true" />
            <span>GitHub</span>
          </Link>
        </footer>
      </div>
    </main>
  );
}
