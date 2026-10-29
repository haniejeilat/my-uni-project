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

