/**
 * BOQ calculation engine (pure functions — no I/O).
 * Costs are per-unit; totals multiply by quantity.
 * Requirement: Material/Labor/Equipment/Cost/Selling totals, Gross Profit, Margin %.
 */

export type ItemCosts = {
  quantity: number;
  materialCost: number;
  laborCost: number;
  equipmentCost: number;
  overhead: number;
  sellingPrice: number;
};

export type ItemTotals = {
  unitCost: number;
  lineMaterial: number;
  lineLabor: number;
  lineEquipment: number;
  lineOverhead: number;
  lineCost: number;
  lineSelling: number;
  lineProfit: number;
  marginPct: number;
};

export type BoqTotals = {
  materialTotal: number;
  laborTotal: number;
  equipmentTotal: number;
  overheadTotal: number;
  costTotal: number;
  sellingTotal: number;
  grossProfit: number;
  marginPct: number;
  itemCount: number;
};

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Margin as a percentage of selling price (0 when selling is 0). */
export function marginPct(selling: number, cost: number): number {
  if (selling <= 0) return 0;
  return round2(((selling - cost) / selling) * 100);
}

export function computeItem(i: ItemCosts): ItemTotals {
  const qty = i.quantity || 0;
  const unitCost =
    (i.materialCost || 0) +
    (i.laborCost || 0) +
    (i.equipmentCost || 0) +
    (i.overhead || 0);
  const lineMaterial = round2((i.materialCost || 0) * qty);
  const lineLabor = round2((i.laborCost || 0) * qty);
  const lineEquipment = round2((i.equipmentCost || 0) * qty);
  const lineOverhead = round2((i.overhead || 0) * qty);
  const lineCost = round2(unitCost * qty);
  const lineSelling = round2((i.sellingPrice || 0) * qty);
  const lineProfit = round2(lineSelling - lineCost);
  return {
    unitCost: round2(unitCost),
    lineMaterial,
    lineLabor,
    lineEquipment,
    lineOverhead,
    lineCost,
    lineSelling,
    lineProfit,
    marginPct: marginPct(lineSelling, lineCost),
  };
}

const EMPTY: BoqTotals = {
  materialTotal: 0,
  laborTotal: 0,
  equipmentTotal: 0,
  overheadTotal: 0,
  costTotal: 0,
  sellingTotal: 0,
  grossProfit: 0,
  marginPct: 0,
  itemCount: 0,
};

export function sumTotals(items: ItemCosts[]): BoqTotals {
  const acc = items.reduce<BoqTotals>((t, raw) => {
    const c = computeItem(raw);
    t.materialTotal += c.lineMaterial;
    t.laborTotal += c.lineLabor;
    t.equipmentTotal += c.lineEquipment;
    t.overheadTotal += c.lineOverhead;
    t.costTotal += c.lineCost;
    t.sellingTotal += c.lineSelling;
    t.itemCount += 1;
    return t;
  }, { ...EMPTY });

  acc.materialTotal = round2(acc.materialTotal);
  acc.laborTotal = round2(acc.laborTotal);
  acc.equipmentTotal = round2(acc.equipmentTotal);
  acc.overheadTotal = round2(acc.overheadTotal);
  acc.costTotal = round2(acc.costTotal);
  acc.sellingTotal = round2(acc.sellingTotal);
  acc.grossProfit = round2(acc.sellingTotal - acc.costTotal);
  acc.marginPct = marginPct(acc.sellingTotal, acc.costTotal);
  return acc;
}
