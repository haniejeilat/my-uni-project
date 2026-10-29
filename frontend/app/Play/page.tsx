//@ts-nocheck
'use client'
import { useEffect, useRef, useState } from "react";
import Menu from '@/app/Menu/page.tsx';
import Aim from "../Components/aim/page.tsx";
import MainComponents from "@/app/Components/page.tsx";
import { useVRGameLoop } from "@/app/hooks/useVRGameLoop/page.ts";
import Timer from "@/app/hooks/timer/page.tsx";
import Thermometer from "@/app/Components/thermometer/page.tsx";
import NpcChat from "../Components/chatnpc/page.tsx";
import Dealer from "../Components/dealer/page.tsx";
import { getDealer, initialStock } from "@/app/utils/dealer/page";
import Intro from "../Components/intro/page.tsx";
import DIALOGUES from "@/public/data/dialogues.json";

const { intro: INTRO, talk: TALK, morning: MORNING } = DIALOGUES;
const SENTENCES = [...INTRO, ...TALK, ...MORNING];
const STOPS = [INTRO.length + TALK.length, SENTENCES.length]; // the chat closes when it reaches these
export default function VRScence() {
  const refs = {
    walkref: useRef(null),
    camref: useRef(null),
    inventoryref: useRef(null),
    keyref: useRef(null),
    landref: useRef(null),
    saveRef: useRef(null),
    chooseref : useRef(null),
    solidbarref : useRef(null),
    solidbarref1 : useRef(null),
    solidbarref2 : useRef(null),
    rasptool : useRef(null),
    brokensolidref : useRef(null),
    brokensolidref1 : useRef(null),
    progressfillref: useRef(null),
    alertfillref: useRef(null),
    roperef : useRef(null),
    coverref: useRef(null),
    chairref1 : useRef(null),
    chairref2 : useRef(null),
    chairref3 : useRef(null),
    npcref : useRef(null),
    NPC1pressE : useRef(false),
    npcpoliceref : useRef(null),
    npcsetref : useRef(null),
    celldoorref : useRef(null),
    sleepref : useRef(null),
    buildingdoorref : useRef(null)
  };

  const inventory = [];

  const [intro, setIntro] = useState(true);
  const [pause, setPause] = useState(false);
  const pauseRef = useRef(false);
  const [interialtimer , setinterialtimer] = useState(30);
  const [phase, setPhase] = useState('night');
  const timerRef = useRef(null);
  useEffect(() => { pauseRef.current = pause || intro; timerRef.current = interialtimer; }, [pause, interialtimer, intro]);

  const [items, setItems] = useState<string[]>([]);
  const itemsref = useRef([]);
  itemsref.current = items;

    const [chatStep, setChatStep] = useState(-1);
    refs.NPC1pressE.current = chatStep >= 0;
    const [npcList, setNpcList] = useState(false);
    refs.NPC1pressE.current = chatStep >= 0 || npcList;
    const [dealerStock, setDealerStock] = useState<string[]>(() => initialStock(getDealer(1)));

    useEffect(() => {
      const next = () => {
        if (pauseRef.current) return;
        setChatStep((s) => (s < 0 || STOPS.includes(s + 1) ? -1 : s + 1));
      };
      window.addEventListener('click', next);
      return () => window.removeEventListener('click', next);
    }, []);


      
      

      const morningDone = useRef(false);
      useEffect(() => {
        if (new URLSearchParams(window.location.search).get('continue') === '1') { setIntro(false); morningDone.current = true; }
      }, []);
      useEffect(() => {
        if (phase === 'day' && !morningDone.current) { morningDone.current = true; setChatStep(INTRO.length + TALK.length); }
      }, [phase]);

      const talk = (v) => setChatStep(v === 0 ? INTRO.length : v); // E at night replays only the cellmate talk
      useVRGameLoop(refs, itemsref, setItems, pauseRef, timerRef, setPause, setinterialtimer, talk, setPhase, setNpcList);
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <MainComponents
        walkref={refs.walkref}
        camref={refs.camref}
        inventoryref={refs.inventoryref}
        landref={refs.landref}
        chooseref = {refs.chooseref}
        solidbarref = {refs.solidbarref}
        solidbarref1 = {refs.solidbarref1}
        solidbarref2 = {refs.solidbarref2}
        rasptool = {refs.rasptool}
        brokensolidref = {refs.brokensolidref}
        brokensolidref1 = {refs.brokensolidref1}
        roperef = {refs.roperef}
        coverref={refs.coverref}
        chairref1 = {refs.chairref1}
        chairref2 = {refs.chairref2}
        chairref3 = {refs.chairref3}
        npcref = {refs.npcref}
        npcpoliceref = {refs.npcpoliceref}
        npcsetref = {refs.npcsetref}
        celldoorref = {refs.celldoorref}
        sleepref = {refs.sleepref}
        buildingdoorref = {refs.buildingdoorref}
        />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, background: '#1b2a6b', mixBlendMode: 'multiply', opacity: phase === 'night' ? 0.8 : 0, transition: 'opacity 2s' }} />

      {/*----------------------aim templer-----------------*/}
      <Aim />

      {/*----------------------NPC Chat-----------------*/}
      {chatStep >= 0 && <NpcChat sentence={SENTENCES[chatStep]} />}

      {/*---------------------Thermometer for actions----------------*/}
      <Thermometer fillref={refs.progressfillref} color="#2ecc71" label="Progress" left={20} />
      <Thermometer fillref={refs.alertfillref} color="#e74c3c" label="Alert" left={90} />

      <Timer interialtimer = {interialtimer} phase = {phase} />
      
      {/*---------------------inventory--------------------*/}
      <div id = "inventory-container" ref = {refs.inventoryref}>
      {items.map((url , index) => {
        return <img key = {index} id = {`box-${index}`} src={url} alt="" />;
      })}
      </div>

      {/*----------------trade list------------------------*/}
      {npcList && (
        <Dealer
          dealerId={1}
          items={items}
          setItems={setItems}
          stock={dealerStock}
          setStock={setDealerStock}
          onClose={() => refs.saveRef.current?.closeList()}
        />
      )}

      {/*---------------------pause--------------------*/}
      <Menu
        pausevalue={pause}
        onContinue={() => setPause(false)}
        onSave={() => refs.saveRef.current?.save()}
        onLoad={() => refs.saveRef.current?.load()}
      />

      {intro && <Intro onDone={() => { setIntro(false); setTimeout(() => setChatStep(0), 400); }} />}
    </div>
  );
}
