"use client";

export default function Timer({ interialtimer, phase }: { interialtimer: number; phase: "day" | "night" }) {
  const mm = String(Math.floor(interialtimer / 60)).padStart(2, "0");
  const ss = String(interialtimer % 60).padStart(2, "0");

  return (
    <div id="timer-container" style={{ width: "auto", textAlign: "right" }}>
      <h1>{phase === "day" ? "DAY" : "NIGHT"} {mm}:{ss}</h1>
      {phase === "night" && (
        <>
          <div style={{ fontSize: 14 }}>Z : sleep</div>
          <div style={{ fontSize: 14 }}>E : talk</div>
        </>
      )}
    </div>
  );
}