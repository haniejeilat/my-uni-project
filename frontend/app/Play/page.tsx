//@ts-nocheck
'use client'
import { useEffect, useRef, useState } from "react";
import Menu from '@/app/Menu/page.tsx';
import Aim from "../Components/aim/page.tsx";
import MainComponents from "@/app/Components/page.tsx";
import { useVRGameLoop } from "@/app/hooks/useVRGameLoop/page.ts";

export default function VRScence() {
  const refs = {
    walkref: useRef(null),
    camref: useRef(null),
    inventoryref: useRef(null),
    keyref: useRef(null),
    Doorref: useRef(null),
    landref: useRef(null),
    wallref: useRef(null),
    wallref1: useRef(null),
    wallref2: useRef(null),
    smallwallref: useRef(null),
    wallwithdoorref: useRef(null),
    npcpoliceref: useRef(null),
    ladderref: useRef(null),
    stairref: useRef(null),
    secondfloorref: useRef(null),
  };

  const [pause, setPause] = useState(false);
  const pauseRef = useRef(false);
  useEffect(() => { pauseRef.current = pause; }, [pause]);

  const [items, setItems] = useState<string[]>([]);
  const itemsref = useRef([]);
  itemsref.current = items;

  useVRGameLoop(refs, itemsref, setItems, pauseRef, setPause);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <MainComponents
        walkref={refs.walkref}
        camref={refs.camref}
        inventoryref={refs.inventoryref}
        Doorref={refs.Doorref}
        landref={refs.landref}
        wallref={refs.wallref}
        wallref1={refs.wallref1}
        wallref2={refs.wallref2}
        smallwallref={refs.smallwallref}
        wallwithdoorref={refs.wallwithdoorref}
        npcpoliceref={refs.npcpoliceref}
        keyref={refs.keyref}
        ladderref={refs.ladderref}
        stairref={refs.stairref}
        secondfloorref={refs.secondfloorref}
        showKey={!items.includes('old_key')}
      />

      {/*----------------------aim templer-----------------*/}
      <Aim />

      {/*---------------------inventory--------------------*/}
      <div ref={refs.inventoryref} id="inventory-container">
        {items.map((url, i) => (
          <img key={i} id={`box-${i}`} src={`/assets/${url}.png`} alt="" />
        ))}
      </div>

      {/*---------------------pause--------------------*/}
      <Menu pausevalue={pause} onContinue={() => setPause(false)} />
    </div>
  );
}
