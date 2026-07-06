/** Contract milestone calculations (pure). */

export type MilestoneAmount = { amount: number };

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function milestonesTotal(milestones: MilestoneAmount[]): number {
  return round2(milestones.reduce((s, m) => s + (m.amount || 0), 0));
}

/** Milestone amounts must equal the contract value (within 1 paisa tolerance). */
export function milestonesBalance(
  milestones: MilestoneAmount[],
  contractValue: number
): { total: number; delta: number; balanced: boolean } {
  const total = milestonesTotal(milestones);
  const delta = round2(total - contractValue);
  return { total, delta, balanced: Math.abs(delta) < 0.01 };
}

/** Amount implied by a percentage of the contract value. */
export function amountForPercent(value: number, percentage: number): number {
  return round2((value * (percentage || 0)) / 100);
}
