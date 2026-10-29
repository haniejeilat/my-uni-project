'use client';
import { useEffect, useRef, useState } from 'react';

const MAP_IMG = '/assets/map.jpg'; // حط صورة الخريطة هون: public/assets/map.jpg
const BLACK = 1500;  // ms شاشة سودا كاملة
const REVEAL = 3500; // ms الأسود بنزل (rgba) والخريطة بتبين بلونها الطبيعي
const GRAY = 3500;   // ms اللون بيتلاشى (أبيض وأسود) + العنوان بيوضح ببطء
const HOLD = 2000;   // ms العنوان واضح
const OUT = 2000;    // ms رجوع الكاميرا للاعب

export default function Intro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0); // 0 أسود | 1 خريطة بلونها | 2 أبيض وأسود + عنوان | 3 خروج
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), BLACK),
      setTimeout(() => setStep(2), BLACK + REVEAL),
      setTimeout(() => setStep(3), BLACK + REVEAL + GRAY + HOLD),
      setTimeout(() => done.current(), BLACK + REVEAL + GRAY + HOLD + OUT),
    ];
    const skip = () => done.current();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      t.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#000',
        opacity: step === 3 ? 0 : 1,
        transition: `opacity ${OUT}ms ease-in-out`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${MAP_IMG})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          filter: `grayscale(${step >= 2 ? 1 : 0})`,
          transition: `filter ${GRAY}ms ease-in-out`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: `rgba(0, 0, 0, ${step === 0 ? 1 : 0.4})`,
          transition: `background-color ${REVEAL}ms ease-in-out`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            color: '#ff6a00',
            fontFamily: "'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(40px, 8vw, 120px)',
            letterSpacing: '0.2em',
            paddingLeft: '0.2em',
            textShadow: '0 0 24px rgba(0, 0, 0, 0.8)',
            opacity: step >= 2 ? 1 : 0,
            filter: step >= 2 ? 'blur(0)' : 'blur(14px)',
            transition: `opacity ${GRAY}ms ease-in, filter ${GRAY}ms ease-out`,
          }}
        >
          PRISON BREAK
        </span>
      </div>
    </div>
  );
}
