//@ts-nocheck
'use client'
import { useEffect, useRef, useState } from "react";
import Menu from '@/app/Menu/page.tsx';
import Aim from "../Components/aim/page.tsx";
import MainComponents from "@/app/Components/page.tsx";
import { useVRGameLoop } from "@/app/hooks/useVRGameLoop/page.ts";
import Timer from "@/app/hooks/timer/page.tsx";
export default function VRScence() {
  const refs = {
    walkref: useRef(null),
    camref: useRef(null),
    inventoryref: useRef(null),
    keyref: useRef(null),
    landref: useRef(null),
    saveRef: useRef(null),
    chooseref : useRef(null)
  };


  const [pause, setPause] = useState(false);
  const pauseRef = useRef(false);
  const [interialtimer , setinterialtimer] = useState(7200);
  const timerRef = useRef(null);
  useEffect(() => { pauseRef.current = pause; timerRef.current = interialtimer; }, [pause, interialtimer]);

  const [items, setItems] = useState<string[]>([]);
  const itemsref = useRef([]);
  itemsref.current = items;

  useVRGameLoop(refs, itemsref, setItems, pauseRef, timerRef, setPause, setinterialtimer);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <MainComponents
        walkref={refs.walkref}
        camref={refs.camref}
        inventoryref={refs.inventoryref}
        landref={refs.landref}
        chooseref = {refs.chooseref}
       />

      {/*----------------------aim templer-----------------*/}
      <Aim />
      <Timer running ={!pause} setinterialtimer = {setinterialtimer} interialtimer = {interialtimer}/>
      {/*---------------------inventory--------------------*/}
      

      {/*---------------------pause--------------------*/}
      <Menu
        pausevalue={pause}
        onContinue={() => setPause(false)}
        onSave={() => refs.saveRef.current?.save()}
        onLoad={() => refs.saveRef.current?.load()}
      />
    </div>
  );
}
