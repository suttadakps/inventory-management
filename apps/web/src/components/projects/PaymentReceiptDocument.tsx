import Image from "next/image";

import type { PaymentReceiptDetail } from "@/lib/projects/repository";
import { formatBaht } from "@/lib/format";
import { PrintButton } from "@/components/boq/PrintButton";

const METHOD_TH: Record<string, string> = {
  cash: "เงินสด",
  bank_transfer: "โอนเงิน",
  cheque: "เช็ค",
  card: "บัตร",
  upi: "UPI",
  other: "อื่นๆ",
};

/** Printable receipt for a single incoming payment (งวด), same visual
 * template as BoqPrintDocument. */
export function PaymentReceiptDocument({
  receipt,
}: {
  receipt: PaymentReceiptDetail;
}) {
  const dateStr = new Date(receipt.date).toLocaleDateString("en-GB");
  const receiptNo = receipt.id.slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-text-primary print:p-0">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <Image
            src="/artiverges-next-logo.png"
            alt="ARTIVERGES NEXT"
            width={180}
            height={42}
            priority
            style={{ height: "auto", width: "170px" }}
          />
          <p className="mt-1 text-caption uppercase tracking-wide text-text-secondary">
            Contractor &amp; Interior Ops
          </p>
        </div>
        <PrintButton />
      </div>

      <h1 className="mb-3 text-h3 font-bold">ใบเสร็จรับเงิน / Receipt</h1>

      <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-1 text-body-sm">
        <div>
          <span className="text-text-secondary">เลขที่: </span>
          {receiptNo}
        </div>
        <div>
          <span className="text-text-secondary">Date: </span>
          {dateStr}
        </div>
        <div>
          <span className="text-text-secondary">Project: </span>
          {receipt.projectName} ({receipt.projectCode})
        </div>
        <div>
          <span className="text-text-secondary">Client: </span>
          {receipt.clientName}
        </div>
        {receipt.siteAddress && (
          <div className="col-span-2">
            <span className="text-text-secondary">Site: </span>
            {receipt.siteAddress}
          </div>
        )}
      </div>

      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-y border-neutral/40 text-left text-caption uppercase text-text-secondary">
            <th className="py-2 pr-2">รายการ</th>
            <th className="py-2 pr-2">ชำระโดย</th>
            <th className="py-2 text-right">จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-neutral/15 align-top">
            <td className="py-2 pr-2">
              {receipt.note || "รับชำระเงินโครงการ"}
            </td>
            <td className="py-2 pr-2">
              {receipt.method ? (METHOD_TH[receipt.method] ?? receipt.method) : "—"}
            </td>
            <td className="py-2 text-right tabular-nums">
              {formatBaht(receipt.amount, true)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-72 space-y-1 text-body-sm">
          <div className="flex justify-between border-t border-neutral/40 pt-1 text-body font-bold">
            <span>รวมรับเงิน</span>
            <span className="tabular-nums">
              {formatBaht(receipt.amount, true)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-8 text-center text-body-sm">
        <div>
          <div className="mb-1 border-t border-neutral/50 pt-2">ผู้รับเงิน</div>
          <div className="text-text-secondary">ARTIVERGES NEXT</div>
        </div>
        <div>
          <div className="mb-1 border-t border-neutral/50 pt-2">ผู้ชำระเงิน</div>
          <div className="text-text-secondary">{receipt.clientName}</div>
        </div>
      </div>
    </div>
  );
}
