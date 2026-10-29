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
