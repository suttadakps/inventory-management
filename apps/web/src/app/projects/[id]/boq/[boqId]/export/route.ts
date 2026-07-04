import { requireUser } from "@/lib/auth/session";
import { getBoqTree } from "@/lib/boq/repository";
import { computeItem } from "@/lib/boq/calc";

/**
 * Excel-compatible CSV export of a BOQ (authorized via the same view rules as
 * the editor). Opens directly in Excel / Google Sheets.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; boqId: string }> }
) {
  const user = await requireUser();
  const { boqId } = await params;

  const tree = await getBoqTree(user, boqId);
  if (!tree) {
    return new Response("Not found", { status: 404 });
  }

  const header = [
    "Section",
    "Category",
    "Item Code",
    "Description",
    "Unit",
    "Quantity",
    "Material Cost",
    "Labor Cost",
    "Equipment Cost",
    "Overhead",
    "Selling Price",
    "Line Cost",
    "Line Selling",
    "Margin %",
  ];

  const cell = (v: string | number | null): string => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const rows: string[] = [header.map(cell).join(",")];

  for (const section of tree.sections) {
    for (const category of section.categories) {
      for (const item of category.items) {
        const c = computeItem(item);
        rows.push(
          [
            section.name,
            category.name,
            item.itemCode ?? "",
            item.description,
            item.unit ?? "",
            item.quantity,
            item.materialCost,
            item.laborCost,
            item.equipmentCost,
            item.overhead,
            item.sellingPrice,
            c.lineCost,
            c.lineSelling,
            c.marginPct,
          ]
            .map(cell)
            .join(",")
        );
      }
    }
  }

  // Totals row
  rows.push(
    [
      "TOTAL",
      "",
      "",
      "",
      "",
      "",
      tree.totals.materialTotal,
      tree.totals.laborTotal,
      tree.totals.equipmentTotal,
      tree.totals.overheadTotal,
      tree.totals.sellingTotal,
      tree.totals.costTotal,
      tree.totals.sellingTotal,
      tree.totals.marginPct,
    ]
      .map(cell)
      .join(",")
  );

  const csv = "﻿" + rows.join("\r\n"); // BOM for Excel UTF-8
  const filename = `BOQ_${tree.project.code}_v${tree.version}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
