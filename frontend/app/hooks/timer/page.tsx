"use client";
import { useEffect, Dispatch, SetStateAction } from "react";

export default function Timer({
  interialtimer,
  setinterialtimer,
  running = true,
  onEnd,
}: {
  interialtimer: number;
  setinterialtimer: Dispatch<SetStateAction<number>>;
  running?: boolean;
  onEnd?: () => void;
}) {
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setinterialtimer((t) => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (interialtimer === 0) onEnd?.();
  }, [interialtimer]);

  const hh = String(Math.floor(interialtimer / 3600)).padStart(2, "0");
  const mm = String(Math.floor((interialtimer % 3600) / 60)).padStart(2, "0");
  const ss = String(interialtimer % 60).padStart(2, "0");

  return <div id="timer-container"><h1>{hh}:{mm}:{ss}</h1></div>;
}