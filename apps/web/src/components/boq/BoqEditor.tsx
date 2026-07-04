"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type {
  BoqTreeDto,
  BoqSectionDto,
  BoqItemDto,
  SupplierOption,
} from "@/lib/boq/repository";
import { computeItem, sumTotals, type ItemCosts } from "@/lib/boq/calc";
import { formatMoney, formatPct } from "@/lib/format";
import {
  addSectionAction,
  renameSectionAction,
  deleteSectionAction,
  moveSectionAction,
  addCategoryAction,
  renameCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  addItemAction,
  updateItemAction,
  deleteItemAction,
  duplicateItemAction,
  moveItemAction,
} from "@/lib/boq/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ---------------------------------------------------------------------------

const toCosts = (i: BoqItemDto): ItemCosts => ({
  quantity: i.quantity,
  materialCost: i.materialCost,
  laborCost: i.laborCost,
  equipmentCost: i.equipmentCost,
  overhead: i.overhead,
  sellingPrice: i.sellingPrice,
});

type SaveState = "idle" | "saving" | "saved" | "error";

export function BoqEditor({
  tree,
  editable,
  suppliers,
}: {
  tree: BoqTreeDto;
  editable: boolean;
  suppliers: SupplierOption[];
}) {
  const router = useRouter();
  const [sections, setSections] = useState<BoqSectionDto[]>(tree.sections);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [save, setSave] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allItems = useMemo(
    () => sections.flatMap((s) => s.categories.flatMap((c) => c.items)),
    [sections]
  );
  const totals = useMemo(() => sumTotals(allItems.map(toCosts)), [allItems]);

  // ---- structural ops (mutate server, then refresh to reseed state) --------
  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error ?? "Action failed.");
        return;
      }
      router.refresh();
    });
  }

  // ---- inline field edits (local state + save on blur) ---------------------
  function patchItem(itemId: string, patch: Partial<BoqItemDto>) {
    setSections((prev) =>
      prev.map((s) => ({
        ...s,
        categories: s.categories.map((c) => ({
          ...c,
          items: c.items.map((it) =>
            it.id === itemId ? { ...it, ...patch } : it
          ),
        })),
      }))
    );
  }

  async function saveItem(item: BoqItemDto) {
    setSave("saving");
    const res = await updateItemAction(item.id, {
      itemCode: item.itemCode,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      materialCost: item.materialCost,
      laborCost: item.laborCost,
      equipmentCost: item.equipmentCost,
      overhead: item.overhead,
      sellingPrice: item.sellingPrice,
      supplierId: item.supplierId,
      notes: item.notes,
    });
    if (res.ok) {
      setSave("saved");
      setTimeout(() => setSave("idle"), 1200);
    } else {
      setSave("error");
      setError(res.error);
    }
  }

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const q = query.trim().toLowerCase();
  const matches = (i: BoqItemDto) =>
    !q ||
    i.description.toLowerCase().includes(q) ||
    (i.itemCode ?? "").toLowerCase().includes(q) ||
    (i.unit ?? "").toLowerCase().includes(q);

  return (
    <div className="space-y-5">
      <SummaryPanel totals={totals} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-56 flex-1">
          <Input
            placeholder="Search items by description, code, or unit…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <SaveIndicator state={pending ? "saving" : save} />
          {editable && (
            <Button
              size="sm"
              onClick={() =>
                run(() => addSectionAction(tree.id, "New section"))
              }
            >
              + Section
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-sm border border-l-4 border-danger bg-surface px-3 py-2 text-body-sm text-danger">
          {error}
        </div>
      )}

      {!editable && (
        <div className="rounded-sm border border-l-4 border-info bg-surface px-3 py-2 text-body-sm text-info">
          This BOQ is read-only in its current state.
        </div>
      )}

      {sections.length === 0 && (
        <div className="rounded-md border border-dashed border-border bg-surface p-10 text-center text-body-sm text-text-secondary">
          No sections yet.{" "}
          {editable ? "Add a section to start building the BOQ." : ""}
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section, si) => (
          <SectionBlock
            key={section.id}
            section={section}
            index={si}
            count={sections.length}
            collapsed={collapsed.has(section.id)}
            editable={editable}
            suppliers={suppliers}
            query={q}
            matches={matches}
            onToggle={() => toggleCollapse(section.id)}
            onPatchItem={patchItem}
            onSaveItem={saveItem}
            run={run}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function SummaryPanel({ totals }: { totals: ReturnType<typeof sumTotals> }) {
  const cells: { label: string; value: string; strong?: boolean }[] = [
    { label: "Material", value: formatMoney(totals.materialTotal, true) },
    { label: "Labor", value: formatMoney(totals.laborTotal, true) },
    { label: "Equipment", value: formatMoney(totals.equipmentTotal, true) },
    { label: "Cost Total", value: formatMoney(totals.costTotal, true), strong: true },
    { label: "Selling Total", value: formatMoney(totals.sellingTotal, true), strong: true },
    { label: "Gross Profit", value: formatMoney(totals.grossProfit, true), strong: true },
    { label: "Margin", value: formatPct(totals.marginPct), strong: true },
  ];
  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-h3 font-semibold text-text-primary">
          Project Summary
        </h2>
        <span className="text-caption text-text-secondary">
          {totals.itemCount} item{totals.itemCount === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cells.map((c) => (
          <div key={c.label} className="rounded-sm bg-bg p-3">
            <div className="text-caption uppercase tracking-wide text-text-secondary">
              {c.label}
            </div>
            <div
              className={
                c.strong
                  ? "mt-1 font-mono text-body font-semibold tabular-nums text-text-primary"
                  : "mt-1 font-mono text-body-sm tabular-nums text-text-primary"
              }
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const text =
    state === "saving"
      ? "Saving…"
      : state === "saved"
        ? "Saved"
        : state === "error"
          ? "Save failed"
          : "";
  if (!text) return <span className="text-caption text-text-disabled">Auto-save on</span>;
  return (
    <span
      className={
        state === "error"
          ? "text-caption text-danger"
          : "text-caption text-text-secondary"
      }
    >
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------

type RunFn = (fn: () => Promise<{ ok: boolean; error?: string }>) => void;

function SectionBlock({
  section,
  index,
  count,
  collapsed,
  editable,
  suppliers,
  query,
  matches,
  onToggle,
  onPatchItem,
  onSaveItem,
  run,
}: {
  section: BoqSectionDto;
  index: number;
  count: number;
  collapsed: boolean;
  editable: boolean;
  suppliers: SupplierOption[];
  query: string;
  matches: (i: BoqItemDto) => boolean;
  onToggle: () => void;
  onPatchItem: (itemId: string, patch: Partial<BoqItemDto>) => void;
  onSaveItem: (item: BoqItemDto) => void;
  run: RunFn;
}) {
  const sectionItems = section.categories.flatMap((c) => c.items);
  const sellTotal = sumTotals(sectionItems.map(toCosts)).sellingTotal;

  // Hide sections with no matching items during search.
  if (query && !sectionItems.some(matches)) return null;

  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface">
      <header className="flex flex-wrap items-center gap-2 border-b border-border bg-bg px-3 py-2">
        <button
          type="button"
          onClick={onToggle}
          className="text-text-secondary hover:text-text-primary"
          aria-label={collapsed ? "Expand section" : "Collapse section"}
        >
          {collapsed ? "▸" : "▾"}
        </button>
        <InlineName
          value={section.name}
          editable={editable}
          className="text-body font-semibold text-text-primary"
          onCommit={(name) => run(() => renameSectionAction(section.id, name))}
        />
        <span className="ml-1 font-mono text-caption text-text-secondary">
          {formatMoney(sellTotal, true)}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {editable && (
            <>
              <MoveButtons
                disableUp={index === 0}
                disableDown={index === count - 1}
                onUp={() => run(() => moveSectionAction(section.id, "up"))}
                onDown={() => run(() => moveSectionAction(section.id, "down"))}
              />
              <button
                type="button"
                onClick={() => run(() => addCategoryAction(section.id, "New category"))}
                className="rounded-sm px-2 py-1 text-caption font-medium text-primary-600 hover:bg-primary-100"
              >
                + Category
              </button>
              <DeleteButton
                label="Delete section"
                confirm={`Delete section "${section.name}" and all its items?`}
                onDelete={() => run(() => deleteSectionAction(section.id))}
              />
            </>
          )}
        </div>
      </header>

      {!collapsed && (
        <div className="divide-y divide-border">
          {section.categories.length === 0 && (
            <p className="px-4 py-3 text-body-sm text-text-secondary">
              No categories.{" "}
              {editable ? "Add a category to add items." : ""}
            </p>
          )}
          {section.categories.map((category, ci) => (
            <CategoryBlock
              key={category.id}
              category={category}
              index={ci}
              count={section.categories.length}
              editable={editable}
              suppliers={suppliers}
              query={query}
              matches={matches}
              onPatchItem={onPatchItem}
              onSaveItem={onSaveItem}
              run={run}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryBlock({
  category,
  index,
  count,
  editable,
  suppliers,
  query,
  matches,
  onPatchItem,
  onSaveItem,
  run,
}: {
  category: BoqSectionDto["categories"][number];
  index: number;
  count: number;
  editable: boolean;
  suppliers: SupplierOption[];
  query: string;
  matches: (i: BoqItemDto) => boolean;
  onPatchItem: (itemId: string, patch: Partial<BoqItemDto>) => void;
  onSaveItem: (item: BoqItemDto) => void;
  run: RunFn;
}) {
  const visibleItems = query ? category.items.filter(matches) : category.items;
  if (query && visibleItems.length === 0) return null;

  const catTotals = sumTotals(category.items.map(toCosts));

  return (
    <div className="px-3 py-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <InlineName
          value={category.name}
          editable={editable}
          className="text-body-sm font-semibold text-primary-700"
          onCommit={(name) => run(() => renameCategoryAction(category.id, name))}
        />
        <span className="font-mono text-caption text-text-secondary">
          cost {formatMoney(catTotals.costTotal, true)} · sell{" "}
          {formatMoney(catTotals.sellingTotal, true)}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {editable && (
            <>
              <MoveButtons
                disableUp={index === 0}
                disableDown={index === count - 1}
                onUp={() => run(() => moveCategoryAction(category.id, "up"))}
                onDown={() => run(() => moveCategoryAction(category.id, "down"))}
              />
              <button
                type="button"
                onClick={() => run(() => addItemAction(category.id))}
                className="rounded-sm px-2 py-1 text-caption font-medium text-primary-600 hover:bg-primary-100"
              >
                + Item
              </button>
              <DeleteButton
                label="Delete category"
                confirm={`Delete category "${category.name}" and its items?`}
                onDelete={() => run(() => deleteCategoryAction(category.id))}
              />
            </>
          )}
        </div>
      </div>

      {visibleItems.length > 0 && (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[1100px] text-left text-body-sm">
            <thead className="bg-bg text-caption uppercase tracking-wide text-text-secondary">
              <tr>
                <th className="px-2 py-2 font-medium">Code</th>
                <th className="px-2 py-2 font-medium">Description</th>
                <th className="px-2 py-2 font-medium">Unit</th>
                <th className="px-2 py-2 text-right font-medium">Qty</th>
                <th className="px-2 py-2 text-right font-medium">Material</th>
                <th className="px-2 py-2 text-right font-medium">Labor</th>
                <th className="px-2 py-2 text-right font-medium">Equip</th>
                <th className="px-2 py-2 text-right font-medium">O/H</th>
                <th className="px-2 py-2 text-right font-medium">Sell</th>
                <th className="px-2 py-2 text-right font-medium">Line cost</th>
                <th className="px-2 py-2 text-right font-medium">Line sell</th>
                <th className="px-2 py-2 text-right font-medium">Margin</th>
                <th className="px-2 py-2 font-medium">Supplier</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleItems.map((item, ii) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  index={ii}
                  count={visibleItems.length}
                  editable={editable}
                  suppliers={suppliers}
                  onPatch={onPatchItem}
                  onSave={onSaveItem}
                  run={run}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ItemRow({
  item,
  index,
  count,
  editable,
  suppliers,
  onPatch,
  onSave,
  run,
}: {
  item: BoqItemDto;
  index: number;
  count: number;
  editable: boolean;
  suppliers: SupplierOption[];
  onPatch: (itemId: string, patch: Partial<BoqItemDto>) => void;
  onSave: (item: BoqItemDto) => void;
  run: RunFn;
}) {
  const c = computeItem(toCosts(item));
  const num = (field: keyof BoqItemDto) => (
    <input
      type="number"
      step="0.01"
      min={0}
      disabled={!editable}
      value={Number.isFinite(item[field] as number) ? (item[field] as number) : 0}
      onChange={(e) => {
        const v = e.target.valueAsNumber;
        onPatch(item.id, { [field]: Number.isNaN(v) ? 0 : v } as Partial<BoqItemDto>);
      }}
      onBlur={() => onSave(item)}
      className="w-24 rounded-sm border border-border bg-surface px-2 py-1 text-right font-mono tabular-nums disabled:opacity-60"
    />
  );
  const txt = (field: keyof BoqItemDto, width: string, placeholder?: string) => (
    <input
      type="text"
      disabled={!editable}
      placeholder={placeholder}
      value={(item[field] as string | null) ?? ""}
      onChange={(e) =>
        onPatch(item.id, { [field]: e.target.value } as Partial<BoqItemDto>)
      }
      onBlur={() => onSave(item)}
      className={`${width} rounded-sm border border-border bg-surface px-2 py-1 disabled:opacity-60`}
    />
  );

  return (
    <tr className="align-top">
      <td className="px-2 py-1.5">{txt("itemCode", "w-24", "Code")}</td>
      <td className="px-2 py-1.5">{txt("description", "w-64", "Description")}</td>
      <td className="px-2 py-1.5">{txt("unit", "w-16", "Unit")}</td>
      <td className="px-2 py-1.5 text-right">{num("quantity")}</td>
      <td className="px-2 py-1.5 text-right">{num("materialCost")}</td>
      <td className="px-2 py-1.5 text-right">{num("laborCost")}</td>
      <td className="px-2 py-1.5 text-right">{num("equipmentCost")}</td>
      <td className="px-2 py-1.5 text-right">{num("overhead")}</td>
      <td className="px-2 py-1.5 text-right">{num("sellingPrice")}</td>
      <td className="px-2 py-1.5 text-right font-mono tabular-nums text-text-secondary">
        {formatMoney(c.lineCost, true)}
      </td>
      <td className="px-2 py-1.5 text-right font-mono tabular-nums text-text-primary">
        {formatMoney(c.lineSelling, true)}
      </td>
      <td
        className={`px-2 py-1.5 text-right font-mono tabular-nums ${
          c.lineProfit < 0 ? "text-danger" : "text-success"
        }`}
      >
        {formatPct(c.marginPct)}
      </td>
      <td className="px-2 py-1.5">
        <select
          disabled={!editable}
          value={item.supplierId ?? ""}
          onChange={(e) => {
            onPatch(item.id, { supplierId: e.target.value || null });
            // supplier change is committed immediately
            onSave({ ...item, supplierId: e.target.value || null });
          }}
          className="w-32 rounded-sm border border-border bg-surface px-2 py-1 disabled:opacity-60"
        >
          <option value="">—</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1.5">
        {editable && (
          <div className="flex items-center gap-1">
            <MoveButtons
              disableUp={index === 0}
              disableDown={index === count - 1}
              onUp={() => run(() => moveItemAction(item.id, "up"))}
              onDown={() => run(() => moveItemAction(item.id, "down"))}
            />
            <button
              type="button"
              title="Duplicate item"
              onClick={() => run(() => duplicateItemAction(item.id))}
              className="rounded-sm px-1.5 py-1 text-caption text-text-secondary hover:bg-primary-100"
            >
              ⧉
            </button>
            <DeleteButton
              label="Delete item"
              confirm="Delete this item?"
              onDelete={() => run(() => deleteItemAction(item.id))}
            />
          </div>
        )}
      </td>
    </tr>
  );
}

// ---- small shared controls --------------------------------------------------

function InlineName({
  value,
  editable,
  className,
  onCommit,
}: {
  value: string;
  editable: boolean;
  className?: string;
  onCommit: (name: string) => void;
}) {
  const [local, setLocal] = useState(value);
  if (!editable) return <span className={className}>{value}</span>;
  return (
    <input
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const v = local.trim();
        if (v && v !== value) onCommit(v);
        else setLocal(value);
      }}
      className={`rounded-sm border border-transparent bg-transparent px-1 py-0.5 hover:border-border focus:border-primary-500 focus:outline-none ${className ?? ""}`}
    />
  );
}

function MoveButtons({
  disableUp,
  disableDown,
  onUp,
  onDown,
}: {
  disableUp: boolean;
  disableDown: boolean;
  onUp: () => void;
  onDown: () => void;
}) {
  const cls =
    "rounded-sm px-1.5 py-1 text-caption text-text-secondary hover:bg-primary-100 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <span className="flex items-center">
      <button type="button" onClick={onUp} disabled={disableUp} className={cls} title="Move up" aria-label="Move up">
        ↑
      </button>
      <button type="button" onClick={onDown} disabled={disableDown} className={cls} title="Move down" aria-label="Move down">
        ↓
      </button>
    </span>
  );
}

function DeleteButton({
  label,
  confirm,
  onDelete,
}: {
  label: string;
  confirm: string;
  onDelete: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => {
        if (window.confirm(confirm)) onDelete();
      }}
      className="rounded-sm px-1.5 py-1 text-caption text-danger hover:bg-primary-100"
    >
      ✕
    </button>
  );
}
