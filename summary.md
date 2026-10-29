This file is a merged representation of the entire codebase, combined into a single document by Repomix.

<file_summary>
This section contains a summary of this file.

<purpose>
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.
</purpose>

<file_format>
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.
</usage_guidelines>

<notes>
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)
</notes>

</file_summary>

<directory_structure>
frontend/
  app/
    Components/
      aim/
        page.tsx
      chatnpc/
        page.tsx
      dealer/
        page.tsx
      intro/
        page.tsx
      thermometer/
        page.tsx
      page.tsx
    hooks/
      timer/
        page.tsx
      useVRGameLoop/
        page.ts
    Menu/
      page.tsx
    Play/
      page.tsx
    utils/
      dealer/
        page.ts
      vrPhysics/
        page.ts
    globals.css
    layout.tsx
    page.tsx
  public/
    assets/
      dealeraudio/
        thememusic.mp3
      dirtTunnel/
        brokenrook.glb
        dirt_tunnel.glb
      dooraudio/
        doormove10.wav
        doormove9.wav
        lockeddoor.flac
      Doors/
        celldoor.glb
        doorprisonoutside.glb
        gatedoorwithoutdoor.glb
        MainPrisonGate.glb
        movingcelldoor.glb
        outsidedoor1.glb
      DoorsAnimation/
        MainPrisonGateAnimation.glb
        outsidedoor2.glb
      menuaudio/
        launch_dnmenu1.wav
        launch_upmenu1.wav
      playeraudio/
        breathe2.wav
        pl_fallpain1.wav
        pl_jump1.wav
        pl_jump2.wav
        pl_ladder1.wav
        pl_ladder2.wav
        pl_ladder3.wav
        pl_ladder4.wav
        pl_metal1.wav
        pl_metal2.wav
        pl_metal3.wav
        pl_metal4.wav
        pl_step1.wav
        pl_step2.wav
        pl_step3.wav
        pl_step4.wav
        pl_tile1.wav
        pl_tile2.wav
        pl_tile3.wav
        pl_tile4.wav
        pl_tile5.wav
      police/
        policelatest.fbx
        policenestedaction.glb
      prisoner/
        body.fbx
        Burpee.fbx
        finalprisoner.glb
        idle.glb
        jump.glb
        nestedActionFinalprisoner1.1.glb
        nestedActionFinalprisoner1.2.glb
        nestedactions.glb
        Prisoner_02.fbx
        prisoner.glb
        settalk.glb
        sleep.glb
        Talking.fbx
        training.glb
        Untitled.fbx
        walk.glb
      tools/
        Benchpress.glb
        chair.glb
        cover.glb
        cover.jpg
        coverrope.glb
        dumbles.glb
        file_or_rasp.glb
        hammer.glb
        multidumbles.glb
        old_key.glb
        old_key.png
        rasp.png
        razerblades.png
        smoothwood.jpg
        solid.glb
        solidwindow.glb
        toothpaste.glb
        toothpaste.png
        woodscraps.jpg
      electreicalSwitch.glb
      finalmap.glb
      finalmap1.1.glb
      finalmap1.2.glb
      finalwatchtower.glb
      mainmap.glb
      map.jpg
      maya2sketchfab.fbx
      menu.jpg
      stair_low_poly.glb
      watchtower.glb
      workshop.glb
    data/
      dialogues.json
  src-tauri/
    capabilities/
      default.json
    icons/
      128x128.png
      128x128@2x.png
      32x32.png
      icon.icns
      icon.ico
      icon.png
      Square107x107Logo.png
      Square142x142Logo.png
      Square150x150Logo.png
      Square284x284Logo.png
      Square30x30Logo.png
      Square310x310Logo.png
      Square44x44Logo.png
      Square71x71Logo.png
      Square89x89Logo.png
      StoreLogo.png
    src/
      lib.rs
      main.rs
    .gitignore
    build.rs
    Cargo.toml
    tauri.conf.json
  .gitignore
  CLAUDE.md
  eslint.config.mjs
  next.config.ts
  package.json
  postcss.config.mjs
  README.md
  tsconfig.json
</directory_structure>

<files>
This section contains the contents of the repository's files.

<file path="frontend/app/Components/dealer/page.tsx">
'use client';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import {
  buy,
  canBuy,
  countOf,
  describeItem,
  getDealer,
  groupItems,
  itemKey,
  moveItem,
} from '@/app/utils/dealer/page';
import type { Deal, Trade, Zone } from '@/app/utils/dealer/page';

type DealerProps = {
  dealerId: number;
  items: string[];
  setItems: Dispatch<SetStateAction<string[]>>;
  stock: string[];
  setStock: Dispatch<SetStateAction<string[]>>;
  onClose: () => void;
};

const rootStyle: CSSProperties = {
  display: 'flex',
  gap: 12,
  padding: 12,
  width: '90%',
  height: '80%',
  background: 'rgba(0, 0, 0, 0.75)',
  color: 'orange',
  fontFamily: 'Courier New, monospace',
  fontSize: 14,
};

const colStyle = (grow: number): CSSProperties => ({
  flex: grow,
  minWidth: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

const gridStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6 };

const headStyle: CSSProperties = { fontSize: 16, fontWeight: 700, borderBottom: '2px solid orange', paddingBottom: 4 };

/* one deal = one row: label  result  =  costs ...  BUY */
const dealStyle: CSSProperties = {
  border: '2px solid #fff',
  borderRadius: 8,
  padding: 4,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 4,
};

const btnStyle = (enabled: boolean): CSSProperties => ({
  padding: '8px 12px',
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 700,
  color: enabled ? '#000' : '#888',
  background: enabled ? 'orange' : 'rgba(255,255,255,0.1)',
  border: 'none',
  borderRadius: 8,
  cursor: enabled ? 'pointer' : 'not-allowed',
});

function Tile({
  item,
  badge,
  ok,
  small,
  onClick,
}: {
  item: string;
  badge?: string;
  ok?: boolean;
  small?: boolean;
  onClick?: () => void;
}) {
  const { name, img } = describeItem(item);
  const box = small ? 54 : 84;
  const pic = small ? 26 : 48;
  return (
    <button
      onClick={onClick}
      title={name}
      style={{
        width: box,
        minHeight: box,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        padding: small ? 2 : 4,
        background: 'rgba(255, 255, 255, 0.08)',
        border: `2px solid ${ok ? '#2ecc71' : '#fff'}`,
        borderRadius: 8,
        color: 'orange',
        fontFamily: 'inherit',
        fontSize: small ? 9 : 11,
        lineHeight: 1.1,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {img && <img src={img} alt={name} style={{ width: pic, height: pic, objectFit: 'contain' }} />}
      <span>{name}</span>
      {badge && <span style={{ color: ok ? '#2ecc71' : '#fff' }}>{badge}</span>}
    </button>
  );
}

export default function Dealer({ dealerId, items, setItems, stock, setStock, onClose }: DealerProps) {
  const dealer = getDealer(dealerId);
  const [resource, setResource] = useState<string[]>([]);

  /* anything still staged when the shop closes goes back to the inventory */
  const resourceRef = useRef<string[]>([]);
  resourceRef.current = resource;
  useEffect(
    () => () => {
      if (resourceRef.current.length) setItems((s) => [...s, ...resourceRef.current]);
    },
    [setItems],
  );

  const trade: Trade = { inventory: items, dealer: stock, resource };

  const apply = (next: Trade) => {
    setItems(next.inventory);
    setStock(next.dealer);
    setResource(next.resource);
  };

  const move = (from: Zone, to: Zone, key: string) => apply(moveItem(trade, from, to, key));

  const onBuy = (deal: Deal) => {
    const next = buy(trade, deal);
    if (next) apply(next);
  };

  return (
    <div id="npc-list-container" style={rootStyle}>
      <section style={colStyle(1)}>
        <div style={headStyle}>INVENTORY</div>
        <div style={gridStyle}>
          {items.length === 0 && <span>-</span>}
          {groupItems(items).map(([key, n]) => (
            <Tile key={key} item={key} badge={`x${n}`} onClick={() => move('inventory', 'resource', key)} />
          ))}
        </div>
        <span style={{ fontSize: 11 }}>click an item to put it up as resource</span>
      </section>

      <section style={colStyle(2.2)}>
        <div style={headStyle}>{dealer.name.toUpperCase()}</div>
        {dealer.deals.map((deal) => {
          const resultKey = itemKey(deal.result);
          const inStock = countOf(stock, resultKey);
          const can = canBuy(trade, deal);
          return (
            <div key={deal.label} style={dealStyle}>
              <span style={{ fontWeight: 700, width: 14, textAlign: 'center' }}>{deal.label}</span>
              <Tile small item={resultKey} badge={`x${inStock}`} ok={inStock > 0} />
              <span>=</span>
              {deal.cost.map(({ id, qty }) => {
                const key = itemKey(id);
                const staged = countOf(resource, key);
                return (
                  <Tile
                    key={id}
                    small
                    item={key}
                    badge={`${staged}/${qty}`}
                    ok={staged >= qty}
                    onClick={() => move('inventory', 'resource', key)}
                  />
                );
              })}
              <button
                disabled={!can}
                onClick={() => onBuy(deal)}
                style={{ ...btnStyle(can), marginLeft: 'auto', padding: '6px 10px', fontSize: 12 }}
              >
                BUY
              </button>
            </div>
          );
        })}
        <div style={headStyle}>STOCK</div>
        <div style={gridStyle}>
          {stock.length === 0 && <span>-</span>}
          {groupItems(stock).map(([key, n]) => (
            <Tile key={key} small item={key} badge={`x${n}`} />
          ))}
        </div>
      </section>

      <section style={colStyle(1)}>
        <div style={headStyle}>RESOURCE</div>
        <div style={gridStyle}>
          {resource.length === 0 && <span>-</span>}
          {groupItems(resource).map(([key, n]) => (
            <Tile key={key} item={key} badge={`x${n}`} onClick={() => move('resource', 'inventory', key)} />
          ))}
        </div>
        <span style={{ fontSize: 11 }}>click to take it back</span>
        <button onClick={onClose} style={btnStyle(true)}>
          CLOSE [E]
        </button>
      </section>
    </div>
  );
}
</file>

<file path="frontend/app/Components/intro/page.tsx">
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
</file>

<file path="frontend/app/utils/dealer/page.ts">
export type Zone = 'inventory' | 'dealer' | 'resource';
export type Trade = Record<Zone, string[]>;

export type ItemId = 'razor' | 'wood' | 'tobacco' | 'shiv';
export type ItemDef = { id: ItemId; name: string; img: string };
export type Cost = { id: ItemId; qty: number };
export type Deal = { label: string; result: ItemId; cost: Cost[]; limit?: number };
export type DealerDef = { id: number; name: string; stock: ItemId[]; deals: Deal[] };

/*------------------------------------------------------------------
  ITEMS - img = the SAME string you push into the user items list (`items`).
  Empty for now: until you fill it, an item is stored as 'item:<id>'.
------------------------------------------------------------------*/
export const ITEMS: Record<ItemId, ItemDef> = {
  razor: { id: 'razor', name: 'Razor Blades', img: '' },
  wood: { id: 'wood', name: 'Smooth Wood', img: '' },
  tobacco: { id: 'tobacco', name: 'Tobacco Pack', img: '' },
  shiv: { id: 'shiv', name: 'Homemade Shiv', img: '' },
};

/*------------------------------------------------------------------
  DEALERS - stock = what the dealer holds at the start, deals = what he sells
------------------------------------------------------------------*/
export const DEALERS: DealerDef[] = [
  {
    id: 1,
    name: 'Dealer',
        stock: ['shiv'],
    deals: [
      {
        label: 'A',
        result: 'shiv',
         limit: 1,
        cost: [
          { id: 'razor', qty: 1 },
          { id: 'wood', qty: 3 },
          { id: 'tobacco', qty: 2 },
        ],
      },
    ],
  },
];

export const getDealer = (id: number): DealerDef => DEALERS.find((d) => d.id === id) ?? DEALERS[0];

/* the string that represents an item inside the inventory / dealer / resource lists */
export const itemKey = (id: ItemId): string => ITEMS[id].img || `item:${id}`;

export const initialStock = (dealer: DealerDef): string[] => dealer.stock.map(itemKey);

export const countOf = (list: string[], key: string): number =>
  list.reduce((n, k) => (k === key ? n + 1 : n), 0);

export const groupItems = (list: string[]): [string, number][] => {
  const m = new Map<string, number>();
  list.forEach((k) => m.set(k, (m.get(k) ?? 0) + 1));
  return Array.from(m.entries());
};

/* name + image for any key (catalog item, placeholder, or a plain image path like /assets/tools/rasp.png) */
export const describeItem = (key: string): { name: string; img: string } => {
  const def = Object.values(ITEMS).find((d) => itemKey(d.id) === key);
  if (def) return { name: def.name, img: def.img };
  const isPath = key.includes('/');
  const file = key.split('/').pop() ?? key;
  return { name: file.replace(/\.[^.]+$/, ''), img: isPath ? key : '' };
};

/*------------------------------------------------------------------
  moveItem - THE function that moves ONE item between the three places:
    'inventory' (player items), 'dealer' (dealer shop stock), 'resource' (items put up to pay)
  Returns a new Trade (nothing is mutated). Returns the same Trade if the item is not in `from`.
------------------------------------------------------------------*/
export const moveItem = (trade: Trade, from: Zone, to: Zone, key: string): Trade => {
  const i = trade[from].indexOf(key);
  if (from === to || i < 0) return trade;
  const source = trade[from].slice();
  source.splice(i, 1);
  return { ...trade, [from]: source, [to]: [...trade[to], key] };
};

/* the player already holds as many copies of the result as the deal allows */
export const isMaxed = (trade: Trade, deal: Deal): boolean =>
  deal.limit !== undefined && countOf(trade.inventory, itemKey(deal.result)) >= deal.limit;

/* not maxed + enough resource staged + the dealer still has the result in stock */
export const canBuy = (trade: Trade, deal: Deal): boolean =>
  !isMaxed(trade, deal) &&
  countOf(trade.dealer, itemKey(deal.result)) > 0 &&
  deal.cost.every(({ id, qty }) => countOf(trade.resource, itemKey(id)) >= qty);
/*------------------------------------------------------------------
  buy - resource -> dealer (payment), then dealer -> inventory (the result)
  Returns the new Trade, or null if the deal can not be bought yet.
------------------------------------------------------------------*/
export const buy = (trade: Trade, deal: Deal): Trade | null => {
  if (!canBuy(trade, deal)) return null;
  let next = trade;
  deal.cost.forEach(({ id, qty }) => {
    for (let i = 0; i < qty; i++) next = moveItem(next, 'resource', 'dealer', itemKey(id));
  });
  return moveItem(next, 'dealer', 'inventory', itemKey(deal.result));
};
</file>

<file path="frontend/public/data/dialogues.json">
{
  "intro": [
    "Howdy, I'm Gustave. I ended up behind these bars because I rode with a pack of trash fellas as bad as myself—bastards, thieves, killers.",
    "I'm used to the smell of rust, and this shit is my home now.",
    "But I got some news, and something broke inside me. My mother is about to die, and I want to see her one last time to say sorry.",
    "I must find a way to leave this shit."
  ],
  "talk": [
    "Cellmate: You're awful quiet today, Gustave... What's the matter, big guy? Thinking about offing yourself and save the hangman some trouble?",
    "Gustave: STFU... I'm just— I ain't...",
    "Gustave: It's my mother. She's about to die, and I wanna see her one last time to say sorry. So I'm breaking out of here.",
    "Cellmate: Mm... I see. I know a guy who knows a guy called Dealer. He could help you find some tools, based on your approach. What do you think? (Engineer / Dealer / Miner)",
    "Gustave: Dealer. That sounds like the right guy.",
    "Cellmate: Yeah, big guy, that's a great idea. I'll introduce you to him tomorrow. Maybe you'll find something to use on those bars."
  ],
  "morning": [
    "Cellmate: Howdy, Dealer. I want to introduce you to my good friend, Gustave.",
    "Dealer: Hey, Gustave. Nice to meet you.",
    "Gustave: Nice to meet you.",
    "Cellmate: He might need some tools in the next few days, and you can trust him—he's like a brother to me.",
    "Dealer: Of course, we can sort something out... but everything has a price. Check my list."
  ]
}
</file>

<file path="frontend/app/Components/aim/page.tsx">
export default function Aim() {
        return (
          <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 20,
          height: 20,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 10
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 9,
            left: 0,
            width: 20,
            height: 2,
            background: '#fff',
            boxShadow: '0 0 2px #000'
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 9,
            top: 0,
            width: 2,
            height: 20,
            background: '#fff',
            boxShadow: '0 0 2px #000'
          }}
        />
      </div>
    );
}
</file>

<file path="frontend/app/Components/chatnpc/page.tsx">
export default function NpcChat({ sentence }: { sentence: string }) {
    return (
        <div style={{ position: "absolute", width: "98%", height: "30%", zIndex: 111, bottom: 0, left: "50%", transform: "translateX(-50%)", background: "rgb(0, 0, 0, 0.2)", color: "orange", fontFamily: "Courier New, monospace", fontSize: 24, padding: 20 }}>
            {sentence}
        </div>
    );
}
</file>

<file path="frontend/app/Components/thermometer/page.tsx">
export default function Thermometer({ fillref, color, label, left }:any) {
  return (
    <div style={{ position: 'absolute', top: 20, left, zIndex: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', color: 'orange', fontFamily: 'Courier New, monospace', fontSize: 12 }}>
      <div style={{ width: 18, height: 160, background: 'rgba(0,0,0,0.4)', border: '2px solid #fff', borderRadius: '9px 9px 0 0', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
        <div ref={fillref} style={{ width: '100%', height: '0%', background: color, transition: 'height 0.15s linear' }} />
      </div>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: color, border: '2px solid #fff', marginTop: -4 }} />
      <span>{label}</span>
    </div>
  );
}
</file>

<file path="frontend/app/hooks/timer/page.tsx">
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
</file>

<file path="frontend/app/layout.tsx">
'use client'
import "@/app/globals.css";

export default function Rootlayout({children} : {children  :React.ReactNode}) {
  return <html lang="ar">
      <body>{children}</body>
    </html>;
    
}
</file>

<file path="frontend/src-tauri/capabilities/default.json">
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "enables the default permissions",
  "windows": [
    "main"
  ],
  "permissions": [
    "core:default",
    "core:window:allow-close"
  ]
}
</file>

<file path="frontend/src-tauri/src/lib.rs">
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
</file>

<file path="frontend/src-tauri/src/main.rs">
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  app_lib::run();
}
</file>

<file path="frontend/src-tauri/.gitignore">
# Generated by Cargo
# will have compiled files and executables
/target/
/gen/schemas
</file>

<file path="frontend/src-tauri/build.rs">
fn main() {
  tauri_build::build()
}
</file>

<file path="frontend/src-tauri/Cargo.toml">
[package]
name = "app"
version = "0.1.0"
description = "A Tauri App"
authors = ["you"]
license = ""
repository = ""
edition = "2021"
rust-version = "1.77.2"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
name = "app_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2.6.3", features = [] }

[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
log = "0.4"
tauri = { version = "2.11.6", features = [] }
tauri-plugin-log = "2"
</file>

<file path="frontend/src-tauri/tauri.conf.json">
{
  "$schema": "../node_modules/@tauri-apps/cli/config.schema.json",
  "productName": "Prison Breakout",
  "version": "0.1.0",
  "identifier": "com.hani.prisonbreakout",
  "build": {
    "frontendDist": "../out",
    "devUrl": "http://localhost:3000",
    "beforeDevCommand": "bun run dev",
    "beforeBuildCommand": "bun run build"
  },
  "app": {
    "windows": [
      {
        "title": "Prison Breakout",
        "width": 800,
        "height": 600,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ],
    "android": {
      "debugApplicationIdSuffix": ".debug"
    }
  }
}
</file>

<file path="frontend/.gitignore">
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
</file>

<file path="frontend/eslint.config.mjs">
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
</file>

<file path="frontend/postcss.config.mjs">
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
</file>

<file path="frontend/tsconfig.json">
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
</file>

<file path="frontend/app/Menu/page.tsx">
import { useState } from "react";
export default function Menu({ pausevalue, onContinue, onSave, onLoad }: {
  pausevalue: boolean;
  onContinue?: () => void;
  onSave?: () => boolean | undefined;
  onLoad?: () => boolean | undefined;
}) {
  const menulist = ["continue", "options", "save", "load", "leave"];
  const [msg, setMsg] = useState('');
  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 1200); };

  return (
    <>
    <div id="menu-container" style={{ display: pausevalue ? 'flex' : 'none' }}>
      {menulist.map((text, i) => (
        <button
          key={i}
          id={`menubtn-${i}`}
          onClick={(e) => {
            e.stopPropagation();
            if (text === 'continue') onContinue?.();
            if (text === 'save') flash(onSave?.() ? 'saved ✓' : 'save failed');
            if (text === 'load') flash(onLoad?.() ? 'loaded ✓' : 'no save found');
            if (text === 'leave') window.location.href = '/';
          }}
        >
          {text}
        </button>
      ))}
      <div style={{ color: 'orange', height: 24 }}>{msg}</div>
    </div>
    </>
  );
}
</file>

<file path="frontend/next.config.ts">
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: false,
};

export default nextConfig;
</file>

<file path="frontend/app/hooks/useVRGameLoop/page.ts">
//@ts-nocheck
'use client'
import {useEffect ,useRef} from "react";
import {
  wallslimiter,
  NpcMovement,
  GravityAndWithJump,
  isPlayerInNpcFOV,
  hasLineOfSight,
  MoveCollide,
  setupSubclips,
  setAnimation,
  POLICE_RANGES,
  spawnNpc,
  spawnDoor,
  npcPatrol,
  NearMeshes, 
  spawnSleep
} from "@/app/utils/vrPhysics/page";
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
export function useVRGameLoop(refs, itemsref, setItems, pauseRef, timerRef, setPause, setinterialtimer , setChatStep, setPhase, setNpcList) {
  /*------------Thermometer-----------*/
    const progress_firstbar = useRef(0);
    const progress_secondbar = useRef(0);
  useEffect(() => {
    require('aframe');
    require('aframe-extras');

    const THREE = window.AFRAME.THREE;

    const {
      walkref, camref, inventoryref,
      landref, saveRef, chooseref ,solidbarref , solidbarref1 , solidbarref2 , rasptool , brokensolidref ,brokensolidref1,
      progressfillref , alertfillref , roperef , coverref , chairref1 , chairref2 , chairref3 , NPC1pressE , npcpoliceref ,npcsetref  , celldoorref, 
    sleepref , buildingdoorref } = refs;

    
    const footstepSounds = [
      new Audio('/assets/playeraudio/pl_step1.wav'),
      new Audio('/assets/playeraudio/pl_step2.wav'),
      new Audio('/assets/playeraudio/pl_step3.wav'),
      new Audio('/assets/playeraudio/pl_step4.wav'),
      new Audio('/assets/playeraudio/pl_jump1.wav'),
      new Audio('/assets/playeraudio/pl_jump2.wav'),
      new Audio('/assets/playeraudio/pl_ladder1.wav'),
      new Audio('/assets/playeraudio/pl_ladder2.wav'),
      new Audio('/assets/playeraudio/pl_ladder3.wav'),
      new Audio('/assets/playeraudio/pl_ladder4.wav'),
    ];

    const doorSounds = [
      new Audio('/assets/dooraudio/doormove9.wav'),
      new Audio('/assets/dooraudio/doormove10.wav'),
      new Audio('/assets/dooraudio/lockeddoor.flac'),
    ];

    const menuSounds = [
      new Audio('/assets/menuaudio/launch_upmenu1.wav'),
      new Audio('/assets/menuaudio/launch_dnmenu1.wav'),
    ];


    /*--------------------Subclips setup & animation-mixer-----------------*/
    let clipsReady = false;
    let policeReady = false;
    let currentClip = '';
    let animationRetry = 0;

    const npcs = [];
        let listOpen = false;
    const openList = () => {
      listOpen = true;
      setNpcList(true);
      if (document.pointerLockElement) document.exitPointerLock();
    };
    const closeList = () => {
      listOpen = false;
      setNpcList(false);
      const canvas = document.querySelector('a-scene canvas');
      if (canvas && document.pointerLockElement !== canvas) {
        const r = canvas.requestPointerLock();
        if (r && r.catch) r.catch(() => {});
      }
    };
    const policeNpcs = [];
    let npcsSpawned = false;
    const NPC_SPAWNS = [
      { x: 4.6, y: 2.6, z: 0, yaw: 180, clip: 'idle', dealer: false },
      { x: -25.31 , y : 0 , z : -17.69 ,yaw : 270 , clip : 'idle', patrol: { walkDistance: 8, walkSpeed: 1.2, idleTime: 3 }, dealer: true },
       ];

    let policeSpawned = false;
    const POLICE_SPAWNS = [
      { x: 0.85, y: 2.8, z: -5.11, yaw: 50, scale: 0.9, clip: 'idle' , patrol: { walkDistance: 12, walkSpeed: 1.2, idleTime: 3 ,  nightYaw: 230  } },
      { x: 5.88, y: 2.6, z: -10.56, yaw: 50, scale: 0.9, clip: 'idle' },
      { x: 5.07, y: 0.09, z: -9.15, yaw: 50, scale: 0.9, clip: 'idle' },
      { x: 2.42, y: 0.09, z: -6.12, yaw: 50, scale: 0.9, clip: 'idle' },
      { x: -36.87, y: 0, z: -9.28, yaw: 140, scale: 0.9, clip: 'idle' },
      { x: -37.37, y: 0, z:-31.12, yaw: 50, scale: 0.9, clip: 'idle' },
      
    ];


    const doors = [];
    let doorsSpawned = false;
    const DOOR_SPAWNS = [
  { x: 3.95, y: 2.73, z: -1.05, yaw: -40, scale: 1, cell: true, src: 'cell', clip: 'door_lambert24_0.004Action.001' },
  { x: 3.19, y: 0.09, z:-8.95, yaw: -35, scale: 0.8, cell: true, src: 'building', clip : 'doorAction' },
  { x: 1, y: 0.09, z:-31.88, yaw: 75, scale: 0.8, cell: true, src: 'building', clip : 'doorAction' },
  { x: 16.88, y: 0.09, z:2.75, yaw: -40, scale: 0.8, cell: true, src: 'building', clip : '' },
  { x: 12.67, y: 0.09, z:-45.4, yaw: 50, scale: 0.8, cell: true, src: 'building', clip : '' },
  { x: -50.73, y: 0.09, z:3.2, yaw: 50, scale: 0.8, cell: true, src: 'building', clip : '' },
  { x: -52.4, y: 0.09, z:-42.15, yaw: -40, scale: 0.8, cell: true, src: 'building', clip : '' },
  { x: -39.6, y: 0.09, z:-29.8, yaw: -200, scale: 0.8, cell: true, src: 'building', clip : 'doorAction'},
  { x: -38.25, y: 0.09, z:-9.7, yaw: -120, scale: 0.8, cell: true, src: 'building', clip : 'doorAction'},
];


   const sleepernpcs = [];
   let sleepSpawned = false;
    const SLEEP_SPAWNS = [
      { x: 10.58, y: 3.22, z: -10.58, yaw: -35, scale: 1, clip: 'sleep' },
      { x: 12.48, y: 3.22, z: -8.88, yaw: -35, scale: 1, clip: 'sleep' },
      { x: 14.5, y: 3.22, z: -7.31, yaw: -35, scale: 1, clip: 'sleep' },
      { x: 16.2, y: 3.22, z: -5.58, yaw: -35, scale: 1, clip: 'sleep' },
      { x: 16.2, y: 0.62, z: -5.58, yaw: -35, scale: 1, clip: 'sleep' },
      { x: 10.58, y: 0.62, z: -10.58, yaw: -35, scale: 1, clip: 'sleep' },
      { x: 12.48, y: 0.62, z: -8.88, yaw: -35, scale: 1, clip: 'sleep' },
      { x: 14.5, y: 0.62, z: -7.31, yaw: -35, scale: 1, clip: 'sleep' },
    ];

    /*--------------------day / night cycle-----------------*/
const DAY_TIME = 90;
const NIGHT_TIME = 30;
const SLEEP_KEY = 'KeyZ';
const CELL_SPAWN = { x: 3.4, y: 2.6, z: 0 };
let phase = 'night';
let phaseT = NIGHT_TIME;
let shownSec = NIGHT_TIME;


const setDoor = (open) => {
  const el = celldoorref?.current;
  if (el) el.object3D.visible = !open;
  doors.forEach((d) => {
    if (!d.spawn.cell) return;
    d.el.object3D.visible = true;
    if (d.mixer) { d.mixer.stopAllAction(); d.mixer.uncacheRoot(d.mesh); d.mixer = null; }
    if (!open || !d.clip) return;
    d.mixer = new THREE.AnimationMixer(d.mesh);
    const action = d.mixer.clipAction(d.clip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
  });
};

const setSleepers = (show) => sleepernpcs.forEach((n) => { n.el.object3D.visible = show; });

const resetNpc = (n) => {
  const s = n.spawn;
  if (!s) return;
  n.el.setAttribute('position', { x: s.x, y: s.y, z: s.z });
  n.el.setAttribute('rotation', { x: 0, y: s.yaw ?? 0, z: 0 });
  n.physics.vy = 0;
  n.patrolState = null;
  n.play(s.clip ?? 'idle', 0);
};

const respawnPlayer = () => {
  const p = walkref.current.object3D;
  p.position.set(CELL_SPAWN.x, CELL_SPAWN.y, CELL_SPAWN.z);
  yaw = 0;
  pitch = 0;
  p.rotation.y = 0;
  camref.current.object3D.rotation.x = 0;
  playerPhysics.vy = 0;
  nx0 = Infinity;
};

const startNight = () => {
  phase = 'night';
  phaseT = NIGHT_TIME;
  shownSec = NIGHT_TIME;
  setPhase('night');
  setinterialtimer(NIGHT_TIME);
  setChatStep(-1);
  closeList();
  respawnPlayer();
  setDoor(false);
  setSleepers(true);
};

const startDay = () => {
  phase = 'day';
  phaseT = DAY_TIME;
  shownSec = DAY_TIME;
  setPhase('day');
  setinterialtimer(DAY_TIME);
  npcs.forEach(resetNpc);
  policeNpcs.forEach(resetNpc);
  setDoor(true);
  setSleepers(false);
};

    /*--------------------body auto-fit (feet on ground, centered under camera)-----------------*/
    const BODY_BACK = 0.3;
    let bodyFitted = false;
    let bodyFitTimer = 0;
    const bodyBox = new THREE.Box3();
    const bodyCenter = new THREE.Vector3();
    const bodyFoot = new THREE.Vector3();

    const fitBody = () => {
      const el = chooseref.current;
      const mesh = el?.getObject3D('mesh');
      const rig = walkref.current?.object3D;
      if (!mesh || !rig) return false;

      // measure with yaw = 0 so the fit does not depend on where the player is looking
      const savedYaw = rig.rotation.y;
      rig.rotation.y = 0;
      rig.updateMatrixWorld(true);

      bodyBox.setFromObject(mesh, true);
      const ok = !bodyBox.isEmpty();
      if (ok) {
        bodyBox.getCenter(bodyCenter);
        bodyFoot.set(bodyCenter.x, bodyBox.min.y, bodyCenter.z);
        rig.worldToLocal(bodyCenter);
        rig.worldToLocal(bodyFoot);
      }

      rig.rotation.y = savedYaw;
      rig.updateMatrixWorld(true);
      if (!ok) return false;

      el.object3D.position.x -= bodyCenter.x;
      el.object3D.position.z -= bodyCenter.z - BODY_BACK;
      el.object3D.position.y -= bodyFoot.y;
      return true;
    };

    chooseref.current?.setAttribute('visible', false);

    
    /*--------------------first-person configs-----------------*/
    const raycaster = new THREE.Raycaster();
    let sceneEl = null;
    const getCam = () => {
      sceneEl = sceneEl || document.querySelector('a-scene');
      return sceneEl?.camera;
    };
    let SPEED = 9;
    const SENS = 0.0022;
    const keys = {};
    let yaw = 0;
    let pitch = 0;
    let doorOpen = false;
    const playerPhysics = { vy: 0, onGround: false, nx: 0, ny: 0 };

    /*--------------------sound loop---------------------*/
    let stepIndex = 0;
    let stepTimer = 0;
    const STEP_INTERVAL = 0.4;

    /*-------------------gravity configs------------------*/
    // The old loop ran two ground blocks and integrated gravity TWICE per frame.
    // These are the single-step values that give the exact same jump as before.
    const GRAVITY = 120;
    const STEP = 1;
    const MAX_STEP = 0.4;
    const STEP_UP = MAX_STEP + 0.05; // highest ledge we walk onto (wall rays start just above it)
    const DOWN = new THREE.Vector3(0, -1, 0);
    const PlayerRay = new THREE.Raycaster();
    const WallRay = new THREE.Raycaster();
    WallRay.firstHitOnly = true;
    const GroundRay = new THREE.Raycaster();
    GroundRay.far = STEP + MAX_STEP + 0.1;
    const CAM_H = 1.7;
    const WALL_RADIUS = 0.25;
    const WALL_FRONT = 0.3;
    const WALL_HEIGHTS = [STEP_UP, 0.9, 1.3, CAM_H];
    const NEAR_R = 4;
    let landPrepared = false;

    let chairsPrepared = false;

    const prepareChairs = () => {
  const els = [chairref1, chairref2, chairref3].map((r) => r?.current);
  if (els.some((el) => !el?.getObject3D('mesh'))) return;
  chairsPrepared = true;
  els.forEach((el) => {
    el.object3D.updateMatrixWorld(true);
    el.getObject3D('mesh').traverse((o) => {
      if (!o.isMesh) return;
      [].concat(o.material).forEach((m) => (m.side = THREE.DoubleSide));
      if (!o.geometry.boundsTree) computeBoundsTree.call(o.geometry);
      o.raycast = acceleratedRaycast;
      landMeshes.push({ mesh: o, box: new THREE.Box3().setFromObject(o) });
    });
  });
  nx0 = Infinity;
};

let doorPrepared = false;

const prepareDoor = () => {
  const el = celldoorref?.current;
  const mesh = el?.getObject3D('mesh');
  if (!mesh) return;
  doorPrepared = true;
  el.object3D.updateMatrixWorld(true);
  mesh.traverse((o) => {
    if (!o.isMesh) return;
    [].concat(o.material).forEach((m) => (m.side = THREE.DoubleSide));
    if (!o.geometry.boundsTree) computeBoundsTree.call(o.geometry);
    o.raycast = acceleratedRaycast;
    landMeshes.push({ mesh: o, box: new THREE.Box3().setFromObject(o) });
  });
  nx0 = Infinity;
};

const prepareSpawnedDoor = (d) => {
  d.el.object3D.updateMatrixWorld(true);
  d.mesh.traverse((o) => {
    if (!o.isMesh) return;
    [].concat(o.material).forEach((m) => (m.side = THREE.DoubleSide));
    if (!o.geometry.boundsTree) computeBoundsTree.call(o.geometry);
    o.raycast = acceleratedRaycast;
    landMeshes.push({ mesh: o, box: new THREE.Box3().setFromObject(o) });
  });
  nx0 = Infinity;
};

    const JUMP = 24; // see GRAVITY
    let JumpEffects = false;

        /*-------------------window escape cutscene------------------*/
    let cine = null;
    let ladderTimer = 0;
    let ladderIndex = 6;
    const CINE_HANG = 1;
    const CINE_SPEED = 1.6;
    const smooth = (t) => t * t * (3 - 2 * t);
    const lerpAngle = (a, b, t) => a + ((((b - a + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) - Math.PI) * t;

    const startCine = () => {
      const ropeMesh = roperef.current.getObject3D('mesh');
      if (!ropeMesh) return;
      const box = new THREE.Box3().setFromObject(ropeMesh);
      const c = box.getCenter(new THREE.Vector3());
      const bar = solidbarref2.current.object3D.position;
      const land = landref.current?.getObject3D('mesh');
      let groundY = box.min.y;
      if (land) {
        PlayerRay.set(new THREE.Vector3(c.x, box.min.y + 0.5, c.z), DOWN);
        const h = PlayerRay.intersectObject(land, true)[0];
        if (h) groundY = h.point.y;
      }
      const topY = box.max.y - CINE_HANG;
      const A = walkref.current.object3D.position.clone();
      const B = new THREE.Vector3(bar.x, topY, bar.z);
      const C = new THREE.Vector3(c.x, topY, c.z);
      const D = new THREE.Vector3(c.x, groundY, c.z);
      cine = {
        t: 0, A, B, C, D,
        T1: 1, T2: 0.5, T3: Math.max((topY - groundY) / CINE_SPEED, 0.5),
        yaw0: yaw, yawT: Math.atan2(-(C.x - A.x), -(C.z - A.z)), pitch0: pitch,
      };
      setAnimation(chooseref,'idle', 0.0001);
    };

    /*-------------------run configs------------------*/
    let runEffect = false;
    const PICKUPDIST = 3;


    
    let alertLevel = 0;
    const ALERT_DECAY = 10;

    /*------------------pick up objects---------------*/
    const ispicked = false;

    /*-------------hover states------------------*/
    const HOVERDIST = 1;
    const NPC_HOVERDIST = 3;
    let hoverTimer = 0;

    /*-------------input event handlers-------------*/
    const down = (e) => {
      keys[e.code] = true;

        if (listOpen) {
        if (!e.repeat && (e.code === 'KeyE' || e.code === 'Escape')) closeList();
        return;
      }

      if (cine && e.code !== 'Escape') return;
      

      if (NPC1pressE.current && e.code !== 'Escape') return;

      if (e.code === SLEEP_KEY && phase === 'night') {
  startDay();
  return;
}


     if (e.code === 'KeyE' && (npcs.some((n) => n.isDealer && IsHovered({ current: n.el }, NPC_HOVERDIST)) || IsHovered(npcsetref, NPC_HOVERDIST))) {
        openList();
        return;
      }

      if (e.code === 'KeyE' && phase === 'night' && !IsHovered(solidbarref, HOVERDIST) && !IsHovered(solidbarref1, HOVERDIST) && !IsHovered(solidbarref2, HOVERDIST)) {
        setChatStep(0);
        return;
      }

      if(e.code === 'KeyE' && !itemsref.current.includes("/assets/tools/rasp.png")) PickUp(rasptool , "/assets/tools/rasp.png" ,PICKUPDIST);
     
      if(e.code === 'KeyE' && !itemsref.current.includes("/assets/tools/cover.jpg")) PickUp(coverref , "/assets/tools/cover.jpg" ,PICKUPDIST);

      if(e.code === 'KeyE' && IsHovered(solidbarref, HOVERDIST) && itemsref.current.includes("/assets/tools/rasp.png")){
        setGauges(true);
        addProgress(1 ,progress_firstbar , solidbarref , brokensolidref);
        addAlert(2 , progress_firstbar);
        }
      
      if(e.code === 'KeyE' && IsHovered(solidbarref1, HOVERDIST) && itemsref.current.includes("/assets/tools/rasp.png")){
        setGauges(true);
        addProgress(1 ,progress_secondbar , solidbarref1 , brokensolidref1);
        addAlert(2 , progress_secondbar);
        }  
      
        if(e.code === 'KeyE' && IsHovered(solidbarref2 , HOVERDIST) && itemsref.current.includes("/assets/tools/cover.jpg")){
        roperef.current.object3D.visible = true;
        if (progress_firstbar.current >= 100 && progress_secondbar.current >= 100 && !cine) startCine();
      }

      if(e.code === 'ShiftLeft'){
        setAnimation(chooseref,'run' , 0.0001);
        SPEED = 18;
        runEffect = true;
        }

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'grid';
      }

     if (e.code === 'Space' && playerPhysics.onGround) {
      playerPhysics.vy = JUMP;
      JumpEffects = true;
    }

      if (e.code === 'Escape') {
        menuSounds[0].play();
        setPause((p) => !p);
      }
    };

    const up = (e) => {
      keys[e.code] = false;

      if(e.code === 'ShiftLeft'){
        setAnimation(chooseref,'walk' , 0.0001);
        SPEED = 9;
        runEffect = false;
        }

      if (e.code === 'KeyG' && inventoryref.current) {
        inventoryref.current.style.display = 'none';
      }
    };

    const onMouseMovenormal = (e) => {
      if (!document.pointerLockElement || cine || NPC1pressE.current) return;

      yaw -= e.movementX * SENS;
      yaw = ((yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      pitch = Math.max(-1.55, Math.min(1.55, pitch - e.movementY * SENS));

      if (walkref.current?.object3D) walkref.current.object3D.rotation.y = yaw;
      if (camref.current?.object3D) camref.current.object3D.rotation.x = pitch;
    };

    const onClick = () => {
      if (listOpen) return;

      const canvas = document.querySelector('a-scene canvas');

      if (canvas && document.pointerLockElement !== canvas) {
        canvas.requestPointerLock();
        return;
      }

      const cam = getCam();

      if (!cam) return;

      raycaster.setFromCamera({ x: 0, y: 0 }, cam);
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('mousemove', onMouseMovenormal);
    window.addEventListener('click', onClick);

    /*-------------------save / load------------------*/
    const SAVE_KEY = 'prison_breakout_save';
    const save = () => {
      try {
        const p = walkref.current.object3D;
        localStorage.setItem(SAVE_KEY, JSON.stringify({
          player: { x: p.position.x, y: p.position.y, z: p.position.z, yaw, pitch },
          timer: Math.ceil(phaseT),
          phase: phase,
          items: itemsref.current,
        }));
        return true;
      } catch { return false; }
    };

    const load = () => {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return false;
        const s = JSON.parse(raw);
        const p = walkref.current.object3D;
        yaw = s.player.yaw;
        pitch = s.player.pitch;
        p.position.set(s.player.x, s.player.y, s.player.z);
        p.rotation.y = yaw;
        camref.current.object3D.rotation.x = pitch;
        playerPhysics.vy = 0;
        setItems(s.items ?? []);
        phase = s.phase === 'night' ? 'night' : 'day';
        const maxT = phase === 'day' ? DAY_TIME : NIGHT_TIME;
        phaseT = typeof s.timer === 'number' ? Math.min(s.timer, maxT) : maxT;
        shownSec = Math.ceil(phaseT);
        setPhase(phase);
        setinterialtimer(shownSec);
        setDoor(phase === 'day');
        setSleepers(phase === 'night');
        return true;
      } catch { return false; }
    };

    saveRef.current = { save, load, closeList };
    let pendingLoad = new URLSearchParams(window.location.search).get('continue') === '1';

    

    let raf;
    let last = 0;

    const landMeshes = [];
let nearby = [];
let nx0 = Infinity;
let nz0 = Infinity;

const prepareLand = (land) => {
  land.updateMatrixWorld(true);
  land.traverse((o) => {
    if (!o.isMesh) return;
    [].concat(o.material).forEach((m) => (m.side = THREE.DoubleSide));
    if (!o.geometry.boundsTree) computeBoundsTree.call(o.geometry);
    o.raycast = acceleratedRaycast;
    landMeshes.push({ mesh: o, box: new THREE.Box3().setFromObject(o) });
  });
  
};

const refreshNearby = (p) => {
  if (Math.hypot(p.x - nx0, p.z - nz0) < 1) return;
  nx0 = p.x;
  nz0 = p.z;
  nearby = landMeshes
    .filter(({ box }) =>
      p.x > box.min.x - NEAR_R && p.x < box.max.x + NEAR_R &&
      p.z > box.min.z - NEAR_R && p.z < box.max.z + NEAR_R)
    .map(({ mesh }) => mesh);
};

const PickUp = (ref, url, dist = PICKUPDIST) => {
  const el = ref.current;
  const mesh = el?.getObject3D('mesh');
  const cam = getCam();
  if (!mesh || !cam || !el.object3D.visible || pauseRef.current) return;

  raycaster.setFromCamera({ x: 0, y: 0 }, cam);
  const box = new THREE.Box3().setFromObject(mesh).expandByScalar(0.05);
  const point = raycaster.ray.intersectBox(box, new THREE.Vector3());
  if (!point || point.distanceTo(raycaster.ray.origin) > dist) return;

  el.object3D.visible = false;
  setItems((s) => [...(s ?? []), url]);
};

const IsHovered = (ref , dist = HOVERDIST) => {
  const el = ref.current;
  const mesh = el?.getObject3D('mesh');
  const cam = getCam();
  if(!mesh || !cam || !el.object3D.visible || pauseRef.current) return false;

  raycaster.setFromCamera({x : 0 , y : 0} , cam);
  const hit = raycaster.intersectObject(mesh , true)[0];
  return !!hit && hit.distance <= dist;
}

const drawGauges = (progressref) => {
  if (progressref && progressfillref.current)
    progressfillref.current.style.height = progressref.current + '%';
  if (alertfillref.current) alertfillref.current.style.height = alertLevel + '%';
};

const setGauges = (v) => {
  [progressfillref, alertfillref].forEach((r) => {
    const root = r.current?.parentElement?.parentElement;
    if (root) root.style.visibility = v ? 'visible' : 'hidden';
  });
};

const addProgress = (v , progressref , refbar , refbrokenbar) => {
  progressref.current = Math.min(100, Math.max(0, progressref.current + v));
  drawGauges(progressref);
  if (progressref.current >= 100) { 
    setGauges(false);
    refbar.current.object3D.visible = false;
    refbrokenbar.current.object3D.visible = true;
    
  }
};

const addAlert = (v , progressref) => {
  alertLevel = Math.min(100, Math.max(0, alertLevel + v));
  drawGauges(progressref);
  if (alertLevel >= 100) {
    return;
  }
};

const HeadRay = new THREE.Raycaster();
HeadRay.firstHitOnly = true;
const UP = new THREE.Vector3(0, 1, 0);
const HEAD = CAM_H;
const headOrigin = new THREE.Vector3();
const probeOrigin = new THREE.Vector3();
const probeHits = [];
const GROUND_PROBES = [[0, 0], [0.2, 0], [-0.2, 0], [0, 0.2], [0, -0.2]];

const npcGround = (npc, dt) => {
  const p = npc.el.object3D.position;
  const meshes = NearMeshes(landMeshes, p.x, p.z, NEAR_R);

  let hit = null;
  for (let i = 0; i < GROUND_PROBES.length; i++) {
    probeOrigin.set(p.x + GROUND_PROBES[i][0], p.y + STEP, p.z + GROUND_PROBES[i][1]);
    GroundRay.set(probeOrigin, DOWN);
    probeHits.length = 0;
    GroundRay.intersectObjects(meshes, false, probeHits);
    for (let j = 0; j < probeHits.length; j++) {
      if (probeHits[j].point.y <= p.y + STEP_UP) {
        if (!hit || probeHits[j].point.y > hit.point.y) hit = probeHits[j];
        break;
      }
    }
  }

  GravityAndWithJump(hit, npc.el, npc.physics, dt, GRAVITY, MAX_STEP);
};

    const loop = (now) => {
      raf = requestAnimationFrame(loop);

      const dt = last !== 0 ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      if (pauseRef.current) return;
      if (!walkref.current?.object3D) return;
      for (let i = 0; i < npcs.length; i++) npcs[i].mixer.update(dt);
      for (let i = 0; i < policeNpcs.length; i++) policeNpcs[i].mixer.update(dt);
            if (cine) {
        const s = cine;
        const p = walkref.current.object3D.position;
        s.t += dt;
        const { t, T1, T2, T3 } = s;
        const ease = smooth(Math.min(t / T1, 1));
        yaw = lerpAngle(s.yaw0, s.yawT, ease);

        if (t < T1) {
          p.lerpVectors(s.A, s.B, ease);
          pitch = s.pitch0 * (1 - ease);
        } else if (t < T1 + T2) {
          p.lerpVectors(s.B, s.C, smooth((t - T1) / T2));
          pitch = 0;
        } else if (t < T1 + T2 + T3) {
          const k = (t - T1 - T2) / T3;
          p.lerpVectors(s.C, s.D, k);
          pitch = -0.5 * Math.sin(k * Math.PI);
          
      
        } else {
          p.copy(s.D);
          pitch = 0;
          cine = null;
          playerPhysics.vy = 0;
          JumpEffects = false;
        }

        walkref.current.object3D.rotation.y = yaw;
        camref.current.object3D.rotation.x = pitch;
        refreshNearby(p);
        return;
      }

      if (!NPC1pressE.current) phaseT -= dt;
        const sec = Math.max(Math.ceil(phaseT), 0);
        if (sec !== shownSec) {
          shownSec = sec;
          setinterialtimer(sec);
        }
        if (phaseT <= 0) {
          if (phase === 'day') startNight();
          else startDay();
        }

      if (!keys.KeyE && alertLevel > 0) addAlert(-ALERT_DECAY * dt);

      hoverTimer += dt;
      if (hoverTimer >= 0.1) {
        hoverTimer = 0;
        if (!IsHovered(solidbarref, HOVERDIST) && !IsHovered(solidbarref1, HOVERDIST)) setGauges(false);
      }

      if (!clipsReady && animationRetry < 300) {
        animationRetry++;

        if (setupSubclips(chooseref)) {
          currentClip = '';
          setAnimation(chooseref,'idle', 0.0001);
          clipsReady = true;
        }
      }

      if (!policeReady && setupSubclips(npcpoliceref, POLICE_RANGES)) {
        setAnimation(npcpoliceref, 'idle', 0.0001, POLICE_RANGES);
        policeReady = true;
      }

      if (policeReady && !policeSpawned) {
        const scn = document.querySelector('a-scene');
        if (scn) {
          policeSpawned = true;
            POLICE_SPAWNS.forEach((s) => {
            const npc = spawnNpc(THREE, npcpoliceref, scn, s, POLICE_RANGES);
            if (npc) { npc.nightOnly = true; npcs.push(npc); }
            
            if (npc) setTimeout(() => {
              npc.el.object3D.updateMatrixWorld(true);
              const b = new THREE.Box3().setFromObject(npc.mesh);
              console.log('[police] pos', npc.el.object3D.position.toArray(), 'min', b.min.toArray(), 'max', b.max.toArray());
            }, 2000);
          });
        }
      }

            if (clipsReady && !npcsSpawned) {
        const scn = document.querySelector('a-scene');
        if (scn) {
          npcsSpawned = true;
          NPC_SPAWNS.forEach((s) => {
            const npc = spawnNpc(THREE, chooseref, scn, s);
            if (npc) { npc.patrolCfg = s.patrol; npc.spawn = s; npc.isDealer = !!s.dealer; npcs.push(npc); }  
          });
        }
      }

      if (!sleepSpawned) {
      const scn = document.querySelector('a-scene');
      if (scn && sleepref?.current?.getObject3D('mesh')) {
        sleepSpawned = true;
        SLEEP_SPAWNS.forEach((s) => {
          const n = spawnSleep(THREE, sleepref, scn, s);
          if (n) sleepernpcs.push(n);
          });
          setSleepers(phase === 'night');
      }
}

      if (!bodyFitted && (clipsReady || animationRetry >= 300)) {
        bodyFitTimer += dt;
        if (bodyFitTimer > 0.4) {
          fitBody();
          bodyFitted = true;
          chooseref.current?.setAttribute('visible', true);
        }
      }

      if (pendingLoad && camref.current?.object3D) {
        pendingLoad = false;
        load();
      }

          const land = landref.current?.getObject3D('mesh');

          if (land && !landPrepared) {
        landPrepared = true;
        prepareLand(land);
      }
      if (!chairsPrepared) prepareChairs();

      if (!doorPrepared) prepareDoor();

if (!doorsSpawned) {
  const scn = document.querySelector('a-scene');
  if (scn && celldoorref?.current?.getObject3D('mesh') && buildingdoorref?.current?.getObject3D('mesh')) {
    doorsSpawned = true;
    DOOR_SPAWNS.forEach((s) => {
      const srcRef = s.src === 'building' ? buildingdoorref : celldoorref;
      const d = spawnDoor(THREE, srcRef, scn, s);
      if (d) {
        const anims = srcRef.current.getObject3D('mesh').animations;
        d.clip = s.clip ? (anims.find((c) => c.name === s.clip) || anims[0]) : null;
        prepareSpawnedDoor(d);
        doors.push(d);
      }
    });
    setDoor(phase === 'day');
  }
}

      if (land) {
        const p = walkref.current.object3D.position;
        refreshNearby(p);

        if (playerPhysics.vy > 0) {
          headOrigin.set(p.x, p.y + HEAD, p.z);
          HeadRay.set(headOrigin, UP);
          HeadRay.far = playerPhysics.vy * dt + 0.1;
          probeHits.length = 0;
          HeadRay.intersectObjects(nearby, false, probeHits);
          if (probeHits.length) playerPhysics.vy = 0;
        }
        GroundRay.far = STEP + MAX_STEP + 0.1 + Math.max(0, -(playerPhysics.vy - GRAVITY * dt) * dt);
        let hit = null;
        for (let i = 0; i < GROUND_PROBES.length; i++) {
          probeOrigin.set(p.x + GROUND_PROBES[i][0], p.y + STEP, p.z + GROUND_PROBES[i][1]);
          GroundRay.set(probeOrigin, DOWN);
          probeHits.length = 0;
          GroundRay.intersectObjects(nearby, false, probeHits);
          for (let j = 0; j < probeHits.length; j++) {
            if (probeHits[j].point.y <= p.y + STEP_UP) {
              if (!hit || probeHits[j].point.y > hit.point.y) hit = probeHits[j];
              break;
            }
          }
        }

        GravityAndWithJump(hit, walkref.current, playerPhysics, dt, GRAVITY, MAX_STEP);

        if (JumpEffects && playerPhysics.onGround) {
          JumpEffects = false;
          footstepSounds[2].play();
        }
      }

      if (land) {
                for (let i = 0; i < npcs.length; i++) {
          if (npcs[i].patrolCfg && (phase === 'night' || !npcs[i].nightOnly)) npcPatrol(npcs[i], dt, npcs[i].patrolCfg);
          else npcGround(npcs[i], dt);
        }
        for (let i = 0; i < policeNpcs.length; i++) npcGround(policeNpcs[i], dt);
        if (phase === 'night') for (let i = 0; i < sleepernpcs.length; i++) sleepernpcs[i].mixer.update(dt);
       for (let i = 0; i < doors.length; i++) doors[i].mixer?.update(dt);
      }

      const X = NPC1pressE.current ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
      const Z = NPC1pressE.current ? 0 : (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);


      if (playerPhysics.onGround && !JumpEffects) {
        if (!X && !Z) {
          setAnimation(chooseref,'idle', 0.0001);
          stepTimer = STEP_INTERVAL;
        } else {
          if(runEffect){
            setAnimation(chooseref,'run', 0.0001);
          }
          else{
            setAnimation(chooseref,'walk', 0.0001);
          }

        }
      }

      if (X || Z) {
        if (playerPhysics.onGround) {
          stepTimer += dt;
          if (stepTimer >= STEP_INTERVAL) {
            stepTimer = 0;
            const s = footstepSounds[stepIndex];
            s.currentTime = 0;
            s.play();
            stepIndex = (stepIndex + 1) % 4;
          }
        }

        const len = Math.sqrt(X ** 2 + Z ** 2);
        const sin = Math.sin(yaw);
        const cos = Math.cos(yaw);
        const dx = (X * cos + Z * sin) / len;
        const dz = (-X * sin + Z * cos) / len;

        const p = walkref.current.object3D.position;
        const mx = dx * SPEED * dt;
        const mz = dz * SPEED * dt;

        if (land) {
          MoveCollide(THREE, nearby, p, mx, mz, WALL_RADIUS, STEP_UP, CAM_H);
        } else {
          p.x += mx;
          p.z += mz;
        }

        playerPhysics.nx = p.x;
        playerPhysics.nz = p.z;
      }

      console.log(walkref.current.object3D.position.x);
      console.log(walkref.current.object3D.position.y);
      console.log(walkref.current.object3D.position.z);

    };
    
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      npcs.forEach((n) => n.dispose());
      policeNpcs.forEach((n) => n.dispose());
      sleepernpcs.forEach((n) => n.dispose());
      doors.forEach((d) => d.dispose());
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('mousemove', onMouseMovenormal);
      window.removeEventListener('click', onClick);
    };
  }, []);
}
</file>

<file path="frontend/app/utils/vrPhysics/page.ts">
//@ts-nocheck
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';

/*------------------------------------------------------------------
  Root-motion neutraliser  (fixes the body spinning / drifting when the
  clip changes idle <-> walk <-> run)

  - animated position / rotation on the NON-bone parents of the skeleton
    (Armature, wrapper nodes) are removed
  - root bone (Hips) position : x / z locked to the first clip's first frame (y is kept)
  - root bone (Hips) rotation : locked to the first clip's first frame
    (set LOCK_ROOT_ROTATION = false to keep the pelvis sway)
------------------------------------------------------------------*/
const LOCK_ROOT_ROTATION = true;

const splitTrackName = (name) => {
  const i = name.indexOf('.');
  return i < 0 ? [name, ''] : [name.slice(0, i), name.slice(i + 1)];
};

const neutralizeRootMotion = (THREE, model, clips) => {
  const clean = (n) =>
    THREE.PropertyBinding && THREE.PropertyBinding.sanitizeNodeName
      ? THREE.PropertyBinding.sanitizeNodeName(n)
      : n.replace(/\s/g, '_').replace(/[\[\].:\/]/g, '');

  const rootBones = [];
  model.traverse((o) => {
    if (o.isBone && !(o.parent && o.parent.isBone)) rootBones.push(o);
  });
  if (!rootBones.length) return;

  const rootNames = new Set(rootBones.map((b) => clean(b.name)));
  const rigidNames = new Set();
  rootBones.forEach((b) => {
    for (let a = b.parent; a && a !== model; a = a.parent) rigidNames.add(clean(a.name));
  });

  const first = {};
  const removed = [];
  const locked = [];

  clips.forEach((clip) => {
    clip.tracks.forEach((t) => {
      const [, p] = splitTrackName(t.name);
      if (p !== 'scale') return;
      const lo = Math.min(...t.values);
      const hi = Math.max(...t.values);
      if (lo < 0.99 || hi > 1.01) console.log('[scale]', clip.name, t.name, lo.toFixed(3), hi.toFixed(3));
      console.log('[tracks]', clip.name, clip.tracks.length);
    });

    clip.tracks = clip.tracks.filter((t) => {
      const [node, prop] = splitTrackName(t.name);
      const rigid =
        rigidNames.has(node) &&
        (prop === 'position' || prop === 'quaternion' || prop === 'rotation' || prop === 'scale');
      if (rigid) removed.push(clip.name + ':' + t.name);
      return !rigid;
    });

    clip.tracks.forEach((t) => {
      const [node, prop] = splitTrackName(t.name);
      if (!rootNames.has(node)) return;
      const v = t.values;

      if (prop === 'position') {
        if (!first[t.name]) first[t.name] = [v[0], v[2]];
        const f = first[t.name];
        for (let i = 0; i < v.length; i += 3) {
          v[i] = f[0];
          v[i + 2] = f[1];
        }
        locked.push(clip.name + ':' + t.name);
      } else if (prop === 'scale') {
        if (!first[t.name]) first[t.name] = [v[0], v[1], v[2]];
        const f = first[t.name];
        for (let i = 0; i < v.length; i += 3) {
          v[i] = f[0];
          v[i + 1] = f[1];
          v[i + 2] = f[2];
        }
        locked.push(clip.name + ':' + t.name);
      } else if (LOCK_ROOT_ROTATION && prop === 'quaternion') {
        if (!first[t.name]) first[t.name] = [v[0], v[1], v[2], v[3]];
        const f = first[t.name];
        for (let i = 0; i < v.length; i += 4) {
          v[i] = f[0];
          v[i + 1] = f[1];
          v[i + 2] = f[2];
          v[i + 3] = f[3];
        }
        locked.push(clip.name + ':' + t.name);
      }
    });

    clip.resetDuration();
  });

  console.info('[rootmotion]', { roots: [...rootNames], rigid: [...rigidNames], removed, locked });
};

export const PRISONER_RANGES = { idle: [1, 108], walk: [110, 180], run: [182, 242] , turn180 : [244 , 263]};
export const POLICE_RANGES = { idle: [1, 115], walk: [150, 183], run: [183, 218], turn180: [218, 237] };

export const setupSubclips = (ref, ranges = PRISONER_RANGES) => {
  const THREE = window.AFRAME.THREE;
  const el = ref?.current;
  if (!el) return false;

  const model = el.getObject3D('mesh');
  if (!model) return false;
  if (model.userData.clipsReady) return true;

  const gltfComponent = el.components['gltf-model'];
  const animations =
    gltfComponent?.model?.animations ?? model.animations;

  if (!animations || animations.length === 0) return false;

  const mainClip = animations[0];
  const FPS = 30;

  const clips = Object.entries(ranges).map(([name, [from, to]]) =>
    THREE.AnimationUtils.subclip(mainClip, name, from, to, FPS)
  );

  neutralizeRootMotion(THREE, model, clips);

  model.animations = clips;

  if (gltfComponent?.model) {
    gltfComponent.model.animations = clips;
  }

  model.userData.clipsReady = true;

  return true;
};

/* setAnimation is called every frame by the game loop: only touch the
   animation-mixer when the clip really changes (no per-frame setAttribute,
   no timers, no console spam). */
const currentClip = new WeakMap();

export const setAnimation = (ref, clipName, crossFade = 0.2, ranges) => {
  const targetEntity = ref?.current;
  if (!targetEntity) return;

  if (!setupSubclips(ref, ranges)) return;

  const model = targetEntity.getObject3D('mesh');
  const state = currentClip.get(targetEntity);
  if (state && state.model === model && state.clip === clipName) return;
  currentClip.set(targetEntity, { model, clip: clipName });

  targetEntity.setAttribute('animation-mixer', {
    clip: clipName,
    crossFadeDuration: crossFade,
    loop: 'repeat',
  });
};

/*------------------------------------------------------------------
  WallCollision - ray fan in front of the player.

  The fan is SYMMETRIC around the player: lateral offsets -0.9 .. +0.9 * radius.
  (Before it was Array.from({ length: 17 }) -> offsets -0.9 .. +3.9, i.e. rays that
  started up to 1.4 m to the RIGHT of the player, inside / behind the walls, so
  every doorway was blocked.)

  Nothing is allocated per call: vectors, offsets and the hit array are reused and
  the returned object is reused too (read x / z immediately).
------------------------------------------------------------------*/
const WALL_OFFSETS = Array.from({ length: 17 }, (_, i) => -0.3 + i * 0.3);
const WALL_MIN_COS = 0.2;
const _wcHits = [];
let _wc = null;

export function WallCollision(THREE, ray, land, pos, mx, mz, radius, heights, front = radius) {
  const c = (_wc = _wc || {
    origin: new THREE.Vector3(),
    dir: new THREE.Vector3(),
    normal: new THREE.Vector3(),
    out: { x: 0, z: 0 },
  });
  const origin = c.origin;
  const dir = c.dir;
  const normal = c.normal;
  let ox = 0;
  let oz = 0;

  for (let pass = 0; pass < 2; pass++) {
    const dist = Math.hypot(mx, mz);
    if (dist < 1e-6) break;

    dir.set(mx / dist, 0, mz / dist);
    const sx = -dir.z;
    const sz = dir.x;
    ray.far = dist + front / WALL_MIN_COS;

    let allowed = dist;
    let nx = 0;
    let nz = 0;

    for (let hi = 0; hi < heights.length; hi++) {
      const h = heights[hi];
      for (let oi = 0; oi < WALL_OFFSETS.length; oi++) {
        const o = WALL_OFFSETS[oi];
        origin.set(pos.x + ox + sx * o * radius, pos.y + h, pos.z + oz + sz * o * radius);
        ray.set(origin, dir);

        _wcHits.length = 0;
        ray.intersectObjects(land, false, _wcHits);
        const hit = _wcHits[0];
        if (!hit || !hit.face) continue;

        normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        if (Math.abs(normal.y) > 0.7) continue;
        normal.y = 0;
        normal.normalize();
        if (normal.x * dir.x + normal.z * dir.z > 0) normal.negate();

        const cos = Math.max(-(normal.x * dir.x + normal.z * dir.z), WALL_MIN_COS);
        const free = hit.distance - front / cos;
        if (free < allowed) {
          allowed = Math.max(free, 0);
          nx = normal.x;
          nz = normal.z;
        }
      }
    }

    ox += dir.x * allowed;
    oz += dir.z * allowed;
    if (allowed >= dist) break;

    const rem = dist - allowed;
    const d = dir.x * nx + dir.z * nz;
    mx = (dir.x - nx * d) * rem;
    mz = (dir.z - nz * d) * rem;
  }

  c.out.x = ox;
  c.out.z = oz;
  return c.out;
}

export function wallslimiter(object3D, objectBox, physics) {
  return (
    object3D.position.y < objectBox.max.y &&
    physics.nx > objectBox.min.x &&
    physics.nx < objectBox.max.x &&
    physics.nz > objectBox.min.z &&
    physics.nz < objectBox.max.z
  );
}

export function NpcMovement(npcmovestates, object3D, Aside, Bside, startnpc, endnpc, npcSpeed, dt) {
  if (!npcmovestates.firstdone) {
    if (object3D.position.x >= endnpc) {
      object3D.position.x = endnpc;
      object3D.rotation.y = Bside;
      npcmovestates.firstdone = true;
    } else {
      object3D.position.x += npcSpeed * dt;
      object3D.rotation.y = Aside;
    }
  } else {
    if (object3D.position.x <= startnpc) {
      object3D.position.x = startnpc;
      object3D.rotation.y = Aside;
      npcmovestates.firstdone = false;
    } else {
      object3D.position.x -= npcSpeed * dt;
      object3D.rotation.y = Bside;
    }
  }
}

export function GravityAndWithJump(landObjecthit, Objectref, physics, dt, GRAVITY, MAX_STEP) {
  const pos = Objectref.object3D.position;
  const nextVy = physics.vy - GRAVITY * dt;
  const nextY = pos.y + nextVy * dt;

  if (
    landObjecthit &&
    physics.vy <= 0 &&
    nextY - landObjecthit.point.y <= MAX_STEP
  ) {
    pos.y = landObjecthit.point.y;
    physics.vy = 0;
    physics.onGround = true;
  } else {
    physics.vy = nextVy;
    pos.y = nextY;
    physics.onGround = false;
  }
};

export function isPlayerInNpcFOV(THREE, npcObject, playerPos, fovDegrees = 90, maxDistance = 30) {
  const npcPos = npcObject.position;
  const dx = playerPos.x - npcPos.x;
  const dz = playerPos.z - npcPos.z;
  const distance = Math.hypot(dx, dz);

  if (distance > maxDistance) return false;

  const forward = new THREE.Vector3(Math.sin(npcObject.rotation.y), 0, Math.cos(npcObject.rotation.y)).normalize();
  const toPlayer = new THREE.Vector3(dx, 0, dz);

  if (toPlayer.lengthSq() === 0) return true;

  toPlayer.normalize();

  const dot = forward.dot(toPlayer);
  const halfFov = THREE.MathUtils.degToRad(fovDegrees / 2);

  return dot >= Math.cos(halfFov);
}

export function segmentIntersectsBox(THREE, from, to, box) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const ray = new THREE.Ray(from, dir.clone().normalize());
  const hit = new THREE.Vector3();

  if (!ray.intersectBox(box, hit)) return false;

  return hit.distanceTo(from) < dir.length() - 0.15;
}

export function hasLineOfSight(THREE, fromPos, toPos, boxes, heights = [0.3, 1.0, 1.6]) {
  for (const h of heights) {
    const from = new THREE.Vector3(fromPos.x, fromPos.y + h, fromPos.z);
    const to = new THREE.Vector3(toPos.x, toPos.y + h, toPos.z);
    const blocked = boxes.some((box) => segmentIntersectsBox(THREE, from, to, box));

    if (!blocked) return true;
  }

  return false;
}

/*------------------------------------------------------------------
  CapsuleCollide  -  the ONE function that keeps the player out of geometry.

  THREE   : window.AFRAME.THREE
  meshes  : array of THREE.Mesh that already have geometry.boundsTree (three-mesh-bvh)
  pos     : walkref.current.object3D.position (the FEET). x / z are corrected in place
  radius  : body radius.  Doorways must be wider than 2 * radius
  bottom  : height above the feet where the body starts. Anything lower is a STEP (ground code climbs it)
  top     : height above the feet of the top of the head
  returns : true if the player was pushed out of something

  Meshes (or parents) with visible = false are ignored -> hide a door to "open" it.
------------------------------------------------------------------*/
let _cc = null;
export function CapsuleCollide(THREE, meshes, pos, radius, bottom, top, iterations = 4) {
  const c = (_cc = _cc || {
    inv: new THREE.Matrix4(),
    box: new THREE.Box3(),
    seg: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3()),
    ws: new THREE.Line3(new THREE.Vector3(), new THREE.Vector3()),
    wb: new THREE.Box3(),
    wt: null,
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
    n: new THREE.Vector3(),
    m: new THREE.Vector3(),
  });

  const y0 = pos.y + bottom + radius;
  const y1 = Math.max(pos.y + top - radius, y0);
  let moved = false;

  for (let it = 0; it < iterations; it++) {
    let best = 1e-8;
    let bx = 0;
    let bz = 0;

    for (const mesh of meshes) {
      const tree = mesh.geometry && mesh.geometry.boundsTree;
      if (!tree) continue;

      let visible = true;
      for (let o = mesh; o; o = o.parent) {
        if (!o.visible) { visible = false; break; }
      }
      if (!visible) continue;

      const mw = mesh.matrixWorld;

      /* stretched meshes (node scale like 16 x 3 x 0.2): the local-space maths below is wrong
         for them, so they are solved in WORLD space. Uniform meshes keep the fast path. */
      const e = mw.elements;
      const lx = Math.hypot(e[0], e[1], e[2]);
      const ly = Math.hypot(e[4], e[5], e[6]);
      const lz = Math.hypot(e[8], e[9], e[10]);
      const smax = Math.max(lx, ly, lz);
      if (smax - Math.min(lx, ly, lz) > smax * 1e-3) {
        if (!mesh.userData.nuLogged) {
          mesh.userData.nuLogged = true;
          console.info('[collision] stretched mesh (world-space path):', mesh.name, [lx, ly, lz]);
        }
        c.inv.copy(mw).invert();
        c.ws.start.set(pos.x, y0, pos.z);
        c.ws.end.set(pos.x, y1, pos.z);
        c.wb.makeEmpty().expandByPoint(c.ws.start).expandByPoint(c.ws.end);
        c.wb.min.addScalar(-radius);
        c.wb.max.addScalar(radius);
        c.box.copy(c.wb).applyMatrix4(c.inv);

        tree.shapecast({
          intersectsBounds: (b) => b.intersectsBox(c.box),
          intersectsTriangle: (tri) => {
            const wt = (c.wt = c.wt || new tri.constructor());
            wt.a.copy(tri.a).applyMatrix4(mw);
            wt.b.copy(tri.b).applyMatrix4(mw);
            wt.c.copy(tri.c).applyMatrix4(mw);
            wt.update();

            const d = wt.closestPointToSegment(c.ws, c.a, c.b);
            if (d >= radius) return;

            if (d > 1e-6) {
              c.n.subVectors(c.b, c.a).divideScalar(d);
            } else {
              wt.getNormal(c.n);
              c.m.subVectors(c.ws.start, c.a);
              if (c.n.dot(c.m) < 0) c.n.negate();
            }

            const depth = radius - d;
            const hx = c.n.x * depth;
            const hz = c.n.z * depth;
            const sq = hx * hx + hz * hz;
            if (sq > best) { best = sq; bx = hx; bz = hz; }
          },
        });
        continue;
      }

      const s = mw.getMaxScaleOnAxis();
      const r = radius / s;
      c.inv.copy(mw).invert();
      c.seg.start.set(pos.x, y0, pos.z).applyMatrix4(c.inv);
      c.seg.end.set(pos.x, y1, pos.z).applyMatrix4(c.inv);
      c.box.makeEmpty().expandByPoint(c.seg.start).expandByPoint(c.seg.end);
      c.box.min.addScalar(-r);
      c.box.max.addScalar(r);

      tree.shapecast({
        intersectsBounds: (b) => b.intersectsBox(c.box),
        intersectsTriangle: (tri) => {
          const d = tri.closestPointToSegment(c.seg, c.a, c.b);
          if (d >= r) return;

          if (d > 1e-6) {
            c.n.subVectors(c.b, c.a).divideScalar(d);
          } else {
            tri.getNormal(c.n);
            c.m.subVectors(c.seg.start, c.a);
            if (c.n.dot(c.m) < 0) c.n.negate();
          }

          c.n.transformDirection(mw);
          const depth = (r - d) * s;
          const hx = c.n.x * depth;
          const hz = c.n.z * depth;
          const sq = hx * hx + hz * hz;
          if (sq > best) { best = sq; bx = hx; bz = hz; }
        },
      });
    }

    if (best <= 1e-8) break;
    pos.x += bx;
    pos.z += bz;
    moved = true;
  }

  return moved;
}

/*------------------------------------------------------------------
  MoveCollide  -  ONE movement function for EVERY character (player, police NPC, ...)

  meshes : BVH meshes near the character (player: `nearby`, NPC: NearMeshes(...))
  pos    : the character's object3D.position (FEET). x / z are moved in place
  mx, mz : wanted displacement this frame (already multiplied by speed * dt)
  radius : body radius.  A doorway is passable only if it is wider than 2 * radius
  bottom : anything lower than this above the feet is a STEP (ground code climbs it)
  top    : height of the head
  returns: true if a wall blocked / pushed the character this frame

  The move is cut into slices of radius / 2, so a fast character (18 m/s,
  dt = 0.1) can never jump over a wall. Sliding along walls / corners is automatic.
------------------------------------------------------------------*/
export function MoveCollide(THREE, meshes, pos, mx, mz, radius, bottom, top) {
  const n = Math.max(1, Math.ceil(Math.hypot(mx, mz) / (radius * 0.5)));
  const sx = mx / n;
  const sz = mz / n;
  let blocked = false;

  for (let i = 0; i < n; i++) {
    pos.x += sx;
    pos.z += sz;
    if (CapsuleCollide(THREE, meshes, pos, radius, bottom, top, 6)) blocked = true;
  }

  return blocked;
}

/*------------------------------------------------------------------
  NearMeshes - meshes of `entries` ({ mesh, box }) close to x / z.
  Use it for every NPC. The returned array is reused: read it before the next call.
------------------------------------------------------------------*/
const _near = [];
export function NearMeshes(entries, x, z, r = 4) {
  _near.length = 0;
  for (let i = 0; i < entries.length; i++) {
    const box = entries[i].box;
    if (x > box.min.x - r && x < box.max.x + r && z > box.min.z - r && z < box.max.z + r) {
      _near.push(entries[i].mesh);
    }
  }
  return _near;
}

/*------------------------------------------------------------------
  spawnNpc - brand-new NPC cloned from an already loaded animated model.
  sourceRef : ref of the entity that already ran setupSubclips (chooseref)
  returns   : { el, mesh, mixer, play, dispose }  (this object IS the NPC "ref")
------------------------------------------------------------------*/
export const spawnNpc = (THREE, sourceRef, sceneEl, { x, y, z, yaw = 0, scale = 0.9, clip = 'idle', patrol = null }, ranges) => {
  const src = sourceRef?.current?.getObject3D('mesh');
  if (!src || !sceneEl || !setupSubclips(sourceRef, ranges) || !src.animations?.length) return null;

  const mesh = cloneSkinned(src);
  mesh.animations = src.animations;

  const mixer = new THREE.AnimationMixer(mesh);
  const actions = {};
  src.animations.forEach((c) => {
    actions[c.name] = mixer.clipAction(c);
  });

  let current = null;
  const play = (name, fade = 0.2) => {
    const next = actions[name];
    if (!next || next === current) return;
    next.reset().fadeIn(fade).play();
    if (current) current.fadeOut(fade);
    current = next;
  };

  play(actions[clip] ? clip : src.animations[0].name, 0);
  play(clip, 0);
  current.time = Math.random() * current.getClip().duration;
  mixer.update(0);

  mesh.updateMatrixWorld(true);
  mesh.traverse((o) => {
    if (o.isSkinnedMesh) o.skeleton.update();
  });
  const box = new THREE.Box3().setFromObject(mesh, true);
  const c = box.getCenter(new THREE.Vector3());
  mesh.position.x -= c.x;
  mesh.position.y -= box.min.y;
  mesh.position.z -= c.z;

  const el = document.createElement('a-entity');
  el.setAttribute('position', { x, y, z });
  el.setAttribute('rotation', { x: 0, y: yaw, z: 0 });
  el.setAttribute('scale', { x: scale, y: scale, z: scale });
  sceneEl.appendChild(el);
  el.setObject3D('mesh', mesh);

  return {
    el,
    mesh,
    mixer,
    play,
    patrolCfg: patrol,
    spawn: { x, y, z, yaw, scale, clip },
    physics: { vy: 0, onGround: false },
    dispose: () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(mesh);
      el.remove();
    },
  };
};

/* idle -> turn180 -> walk(walkDistance) -> idle -> turn180 -> walk ... بدون نهاية
   بتنادى كل frame. cfg: { walkDistance (متر), walkSpeed (متر/ثانية), idleTime (ثواني) } */
const TURN_DIR = 1; // خليها -1 إذا شكل الدوران معكوس
export const npcPatrol = (npc, dt, { walkDistance = 8, walkSpeed = 1.2, idleTime = 3, nightYaw } = {}) => {
  if (!npc.patrolState && nightYaw !== undefined) npc.el.object3D.rotation.y = (nightYaw * Math.PI) / 180;
  const s = (npc.patrolState = npc.patrolState || { phase: 'idle', t: 0, walked: 0, yaw0: 0, turnDur: 0 });
  const o = npc.el.object3D;
  s.t += dt;

  if (s.phase === 'idle') {
    if (s.t < idleTime) return;
    s.phase = 'turn';
    s.t = 0;
    s.yaw0 = o.rotation.y;
    s.turnDur = npc.mesh.animations.find((c) => c.name === 'turn180').duration;
    
  } else if (s.phase === 'turn') {
    o.rotation.y = s.yaw0 + TURN_DIR * Math.PI * Math.min(s.t / s.turnDur, 1);
    if (s.t < s.turnDur) return;
    s.phase = 'walk';
    s.t = 0;
    s.walked = 0;
    npc.play('walk');
  } else {
    const step = Math.min(walkSpeed * dt, walkDistance - s.walked);
    o.position.x += Math.sin(o.rotation.y) * step;
    o.position.z += Math.cos(o.rotation.y) * step;
    s.walked += step;
    if (s.walked < walkDistance) return;
    s.phase = 'idle';
    s.t = 0;
    npc.play('idle');
  }
};

/*------------------------------------------------------------------
  spawnDoor - brand-new static door cloned from an already loaded model
  (same idea as spawnNpc, nothing animated: geometry + materials are shared).
  sourceRef : ref of the entity that holds the door glb (celldoorref)
  spawn     : { x, y, z, yaw, scale, ... }  x / z = centre, y = bottom of the door
  returns   : { el, mesh, spawn, dispose }
  Open a door = hide it (el.object3D.visible = false), same as the cell door.
------------------------------------------------------------------*/
export const spawnDoor = (THREE, sourceRef, sceneEl, spawn) => {
  const { x, y, z, yaw = 0, scale = 1 } = spawn;
  const src = sourceRef?.current?.getObject3D('mesh');
  if (!src || !sceneEl) return null;

  const mesh = src.clone(true);
  mesh.visible = true;
  mesh.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(mesh);
  const c = box.getCenter(new THREE.Vector3());
  mesh.position.x -= c.x;
  mesh.position.y -= box.min.y;
  mesh.position.z -= c.z;

  const el = document.createElement('a-entity');
  el.setAttribute('position', { x, y, z });
  el.setAttribute('rotation', { x: 0, y: yaw, z: 0 });
  el.setAttribute('scale', { x: scale, y: scale, z: scale });
  sceneEl.appendChild(el);
  el.setObject3D('mesh', mesh);

  /* A-Frame applies the attributes a moment later, the collision boxes need the
     final transform right now, so it is also written straight on the object3D */
  el.object3D.position.set(x, y, z);
  el.object3D.rotation.set(0, THREE.MathUtils.degToRad(yaw), 0);
  el.object3D.scale.setScalar(scale);
  el.object3D.updateMatrixWorld(true);

  return {
    el,
    mesh,
    spawn,
    dispose: () => el.remove(),
  };
};

export const sleepnpcs = [];

export const spawnSleep = (THREE, sourceRef, sceneEl, { x, y, z, yaw = 0, scale = 1, clip = 'sleep' }) => {
  const src = sourceRef?.current?.getObject3D('mesh');
  if (!src || !sceneEl || !src.animations?.length) return null;

  const mesh = cloneSkinned(src);
  mesh.animations = src.animations;

  const mixer = new THREE.AnimationMixer(mesh);
  const action = mixer.clipAction(src.animations.find((c) => c.name === clip) || src.animations[0]);
  action.play();
  action.time = Math.random() * action.getClip().duration;
  mixer.update(0);

  const el = document.createElement('a-entity');
  el.setAttribute('position', { x, y, z });
  el.setAttribute('rotation', { x: 0, y: yaw, z: 0 });
  el.setAttribute('scale', { x: scale, y: scale, z: scale });
  sceneEl.appendChild(el);
  el.setObject3D('mesh', mesh);

  return {
    el,
    mesh,
    mixer,
    dispose: () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(mesh);
      el.remove();
    },
  };
};
</file>

<file path="frontend/CLAUDE.md">
# Instructions

## Rules & Response Format
- Provide **COMPLETE**, fully implemented code in all responses. NEVER use placeholders (e.g., `// ... rest of code`, `// TODO`, `// implementation here`).
- Keep explanations **minimal** to conserve tokens. Focus on code. Do not summarize changes unless asked.
- Tech Stack: Next.js (App Router), TypeScript, Tailwind CSS, Three.js / WebVR (A-Frame), Bun / Node.js.

## Current Context
- **Project**: Escape Room WebVR Game (`frontend`)
- **Current Feature**: FIX THE ROTATION FROM CHANGE THE POSITION OF CHARECTER
- **Next Feature**: MAKE THE NPC SET ON CHAIR   chairref1

## Code Quality Standards
- Strict TypeScript types (avoid `any`).
- Follow modular structure in `frontend/app`.
</file>

<file path="frontend/package.json">
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "tauri": "tauri"
  },
  "dependencies": {
    "@belivvr/aframe-react": "^0.4.2",
    "@tauri-apps/api": "^2.11.1",
    "aframe": "^1.8.0",
    "aframe-extras": "^7.7.0",
    "next": "16.3.5",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "three-mesh-bvh": "^0.9.16"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@tauri-apps/cli": "^2.11.5",
    "@types/aframe": "^1.2.10",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.5",
    "tailwindcss": "^4",
    "typescript": "^5"
  },
  "packageManager": "bun@1.3.14",
  "ignoreScripts": [
    "sharp",
    "unrs-resolver"
  ],
  "trustedDependencies": [
    "sharp",
    "unrs-resolver"
  ]
}
</file>

<file path="frontend/README.md">
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash

#first 
bun install
#or
npm install

   |
   |
   V

#frontend 
npm run tauri dev
# or
bun run tauri dev




url for run on web will be shared later or never be share based on offline game standards

```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
</file>

<file path="frontend/app/Components/page.tsx">
//@ts-nocheck
import React,{useRef} from 'react';
export default function MainComponents({ walkref , chooseref , npcref , camref , landref , solidbarref , solidbarref1 , solidbarref2 , rasptool , brokensolidref , brokensolidref1 , roperef , coverref ,chairref1 , chairref2 , chairref3 , npcpoliceref , npcsetref, celldoorref , sleepref , buildingdoorref}: any) {
    return (
        <a-scene
        embedded
        renderer="colorManagement: true"
        >
        <a-assets>
      <a-asset-item
        id="landModel"
        src="/assets/finalmap1.1.glb"
      ></a-asset-item>

      <a-asset-item
        id="prisonerModel"
        src="/assets/prisoner/prisoner.glb"
      ></a-asset-item>

      <a-asset-item
        id="nestedprisonerModel"
        src="/assets/prisoner/nestedActionFinalprisoner1.1.glb"
      ></a-asset-item>

      <a-asset-item
        id="idleprisonerModel"
        src="/assets/prisoner/idle.glb"
      ></a-asset-item>

        <a-asset-item
        id = "solidbarModel"
        src = "/assets/tools/solidwindow.glb"
        ></a-asset-item>

        <a-asset-item
        id = "solidbarModel1"
        src = "/assets/tools/solidwindow.glb"
        ></a-asset-item>

       <a-asset-item
         id = "solidbarModel2"
         src = "/assets/tools/solidwindow.glb"
        ></a-asset-item>

        <a-asset-item
        id = "raspModel"
        src = "/assets/tools/file_or_rasp.glb"
        ></a-asset-item>

        <a-asset-item
        id = "brokensolid"
        src = "/assets/tools/solid.glb"
        ></a-asset-item>

        <a-asset-item
         id = "brokensolid1"
         src = "/assets/tools/solid.glb"
        ></a-asset-item>

        <a-asset-item
         id = "ropeModel"
         src = "/assets/tools/coverrope.glb"
        ></a-asset-item>

        <a-asset-item
         id = "coverModel"
         src = "/assets/tools/cover.glb"
        ></a-asset-item>
        

        <a-asset-item
        id = "chairModel1"
        src = "/assets/tools/chair.glb"
        ></a-asset-item>
        
        <a-asset-item
        id = "chairModel2"
        src = "/assets/tools/chair.glb"
        ></a-asset-item>
        
        <a-asset-item
        id = "chairModel3"
        src = "/assets/tools/chair.glb"
        ></a-asset-item>

        <a-asset-item
        id = "nestedpoliceModel"
        src = "/assets/police/policenestedaction.glb"
        ></a-asset-item>

        
    
        <a-asset-item
        id = "settalkModel"
        src = "/assets/prisoner/settalk.glb"
        ></a-asset-item>

        <a-asset-item
          id = "celldoorModel"
          src = "/assets/Doors/movingcelldoor.glb"
        ></a-asset-item>

        <a-asset-item
        id = "sleepModel"
        src = "/assets/prisoner/sleep.glb"
        ></a-asset-item>

        <a-asset-item
          id = "buildingcelldoorModel"
          src = "/assets/Doors/outsidedoor1.glb"
        ></a-asset-item>
    </a-assets>

       <a-sky color="#87CEED"></a-sky>

        <a-entity
          position="3.4 2.6 0"
          ref={walkref}
        >
     <a-entity
  camera=""
  ref={camref}
  position="0 1.4 0"
></a-entity>

<a-entity
  scale='0.9 0.9 0.9'
  ref={chooseref}
  gltf-model="#nestedprisonerModel"
  rotation="0 180 0"
  position="0 0 0"
></a-entity>
       </a-entity>

        <a-entity
          ref={landref}
          gltf-model="#landModel"
          position="0 0 0"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

          <a-entity
          ref={solidbarref}
          gltf-model="#solidbarModel"
           position="1.4 4.64 0.67"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

          <a-entity
          ref={solidbarref1}
          gltf-model="#solidbarModel1"
           position="1.57 4.64 0.779"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
        ref = {solidbarref2}
        gltf-model = "#solidbarModel2"
        position = "1.73 4.64 0.929"
        scale="1 1 1"
        matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={brokensolidref}
          gltf-model="#brokensolid"
          position="1.493 4.33 0.65"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>

        <a-entity
          ref={brokensolidref1}
          gltf-model="#brokensolid1"
           position="1.66 4.33 0.759"
          scale="1 1 1"
          matrixAutoUpdate="false"
        ></a-entity>
        
        <a-entity
        ref={rasptool}
        gltf-model="#raspModel"
        position="3.4 2.6 0"
        scale = "0.0025 0.0025 0.0025"
        matrixAutoUpdate="false"
        >
        </a-entity>

       <a-entity
       ref = {roperef}
       gltf-model = "#ropeModel"
       scale = "1 1 1" 
       position = "1.72 1.23 1.15"
       rotation = "0 200 0"
       matrixAutoUpdate="false"
       visible="false"
       ></a-entity>
      
    
       <a-entity
       ref = {coverref}
       gltf-model = "#coverModel"
       scale = "1 1 1" 
       position="2.1 3 -0.5"
       rotation = "0 -35 0"
       ></a-entity>

      <a-entity
      ref = {chairref1}
      gltf-model = "#chairModel1"
      scale = "1 1 1"
      position = "-26.5 0 -26.1"
      rotation = "0 0 0"
      matrixAutoUpdate = "false"
      >
      </a-entity>

      <a-entity
      ref = {chairref2}
      gltf-model = "#chairModel2"
      scale = "1 1 1"
      position = "-22.5 0 -31.1"
      rotation = "0 0 0"
      matrixAutoUpdate = "false"
      >
      </a-entity>

      <a-entity
      ref = {chairref3}
      gltf-model = "#chairModel3"
      scale = "1 1 1"
      position = "-30.5 0 -31.1"
      rotation = "0 0 0"
      matrixAutoUpdate = "false"
      >
      </a-entity>
    
      <a-entity
      ref ={npcpoliceref}
      gltf-model = "#nestedpoliceModel"
      visible = "false"
      ></a-entity>
      
    <a-entity
    ref = {npcsetref}
    gltf-model = "#settalkModel"
    scale = "1 1 1"
    position = "-11.3 0 -24.61"
    rotation = "0 270 0"
    animation-mixer = "clip: set; loop: repeat"
    ></a-entity>

    <a-entity
      ref = {celldoorref}
      gltf-model = "#celldoorModel"
      
    ></a-entity>
    
      <a-entity
  ref = {sleepref}
  gltf-model = "#sleepModel"
  visible = "false"
></a-entity>

<a-entity
  ref = {buildingdoorref}
  gltf-model = "#buildingcelldoorModel"
  visible = "false"
></a-entity>
      </a-scene>
     
    );
}
</file>

<file path="frontend/app/globals.css">
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/*--------------------inventory--------------------*/
#inventory-container , #npc-list-container{
 display: none;
grid-template-columns: repeat(4, minmax(0, 1fr));
 grid-template-rows: repeat(4, minmax(0, 1fr));
 margin: 0;
 padding: 0;
 position:absolute;
 top : 50%;
 left: 50%;
transform: translate(-50%, -50%);
width : 70%;
height : 70%;
z-index: 11;
background: rgb(0, 0 ,0 , 0.2);
border-radius : 8px;
}

[id^='box-']{
width: 100%;
height: 100%;
}


/*--------------------mainpage--------------------*/
[id^='btn-']{
display: flex;
width: 250px;
height: 70px;
font-family: 'Courier New', Courier, monospace;
font-weight: 700;
font-size: 18px;
justify-content: center;
align-items: center;
color :  orange;
border: none;
background-color:inherit;
border-radius: 16px;
}

#main-container{
display: flex;
gap: 20px;
flex-direction: column;
background-image: url('/assets/menu.jpg');
background-position: center; 
background-size: cover;
background-repeat: no-repeat;
width: 100vw;
height: 100vh;
justify-content: center;
align-items: start;
}


#main-container div{
background-color: #0084E3;
color : white;
font-weight: 700;
font-size: 68px;
font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
letter-spacing: 7px;
margin-bottom: 100px;
}

/*--------------------pausepage--------------------*/
#menu-container{
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left : 0;
    width: 100vw;
    height: 100vh;
    background: rgb(0, 0 ,0 , 0.2);
    border-radius : 8px;
}
[id^="menubtn-"]{
    width: 250px;
    height: 70px;
    border :none;
    background: none;
    font-size: large;
    color: orange;
    }

#timer-container {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 100px;
    height: 100px;
    color: orange;
    z-index: 12;
}
</file>

<file path="frontend/app/Play/page.tsx">
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
</file>

<file path="frontend/app/page.tsx">
'use client'
import { getCurrentWindow } from '@tauri-apps/api/window';
export default function Main(){
   const menulist = ["Play", "Continue", "Options", 'configrations', "Quit"];
   
   const BtnShortCut = () => {
        return menulist.map((text,index) => {
            return (
              <button 
                key={index} 
                id={`btn-${index}`}
                onClick={async() => {
                    if (text === "Quit") {
                    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
                     await getCurrentWindow().close();
                    }
                    }
                    else if (text === "Continue") {
                        window.location.href = '/Play/?continue=1';
                    }
                    else {
                        return window.location.href = `/${text}/`;
                    }
                }}
              >
                {text}
              </button>
            );
        });
   };

   return (
      <div id="main-container">
          <BtnShortCut/>
      </div>   
   );
}
</file>

</files>
