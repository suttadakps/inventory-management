import type { VatFilingItem } from "@/lib/vat/repository";
import { formatBaht } from "@/lib/format";
import { COMPANY_NAME, COMPANY_ADDRESS } from "@/lib/company";
import { PrintButton } from "@/components/boq/PrintButton";
import { TaxIdBoxes } from "@/components/wht/TaxIdBoxes";

const MONTHS_TH = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className="inline-flex h-3.5 w-3.5 items-center justify-center border border-neutral/60 text-caption leading-none">
      {checked ? "✓" : ""}
    </span>
  );
}

function Cell({ children }: { children?: React.ReactNode }) {
  return (
    <td className="border border-neutral/40 px-2 py-1 text-right tabular-nums">
      {children}
    </td>
  );
}

export function Pp30Document({ filing }: { filing: VatFilingItem }) {
  const field8 = Math.max(0, filing.salesVat - filing.purchaseVat);
  const field9 = Math.max(0, filing.purchaseVat - filing.salesVat);
  const field10 = filing.overpaidPrior;

  let field11 = 0;
  let field12 = 0;
  if (field8 > 0) {
    if (field8 > field10) field11 = field8 - field10;
    else field12 = field10 - field8;
  } else if (field9 > 0) {
    field12 = field9 + field10;
  } else if (field10 > 0) {
    field12 = field10;
  }

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-caption text-text-primary print:p-0">
      <div className="mb-2 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1 text-center">
          <h1 className="text-body font-bold">แบบแสดงรายการภาษีมูลค่าเพิ่ม</h1>
          <p>ตามประมวลรัษฎากร</p>
        </div>
        <div className="w-24 shrink-0 text-right text-body font-bold">ภ.พ.30</div>
      </div>

      <div className="mb-3 space-y-1 border border-neutral/40 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <span>เลขประจำตัวผู้เสียภาษีอากร</span>
          <TaxIdBoxes value={filing.payerTaxId} />
        </div>
        <div>ชื่อผู้ประกอบการ {COMPANY_NAME}</div>
        <div>ชื่อสถานประกอบการ {COMPANY_NAME}</div>
        <div>ที่อยู่ {COMPANY_ADDRESS}</div>
      </div>

      <div className="mb-3 border border-neutral/40 p-2">
        <span className="mr-2">สำหรับเดือนภาษี</span>
        <span className="mr-4">พ.ศ. {filing.periodYear}</span>
        <div className="mt-1 grid grid-cols-4 gap-1">
          {MONTHS_TH.map((m, idx) => (
            <span key={m} className="inline-flex items-center gap-1">
              <Checkbox checked={filing.periodMonth === idx + 1} />
              {m}
            </span>
          ))}
        </div>
      </div>

      <table className="w-full border-collapse text-caption">
        <thead>
          <tr>
            <th className="w-8 border border-neutral/40 px-1 py-1" />
            <th className="border border-neutral/40 px-2 py-1 text-left">
              รายการ
            </th>
            <th className="w-28 border border-neutral/40 px-2 py-1">บาท</th>
            <th className="w-10 border border-neutral/40 px-1 py-1" />
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-neutral/40 px-1 py-1 text-center" rowSpan={5}>
              ภาษี
              <br />
              ขาย
            </td>
            <td className="border border-neutral/40 px-2 py-1">1. ยอดขายในเดือนนี้</td>
            <Cell>{formatBaht(filing.salesTotal, true)}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">1</td>
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              2. ลบ ยอดขายที่เสียภาษีในอัตราร้อยละ 0 (ถ้ามี)
            </td>
            <Cell />
            <td className="border border-neutral/40 px-1 py-1 text-center">2</td>
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              3. ลบ ยอดขายที่ได้รับยกเว้น (ถ้ามี)
            </td>
            <Cell />
            <td className="border border-neutral/40 px-1 py-1 text-center">3</td>
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              4. ยอดขายที่ต้องเสียภาษี (1. - 2. - 3.)
            </td>
            <Cell>{formatBaht(filing.salesTotal, true)}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">4</td>
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1 font-medium">
              5. ภาษีขายเดือนนี้
            </td>
            <Cell>{formatBaht(filing.salesVat, true)}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">5</td>
          </tr>

          <tr>
            <td className="border border-neutral/40 px-1 py-1 text-center" rowSpan={2}>
              ภาษี
              <br />
              ซื้อ
            </td>
            <td className="border border-neutral/40 px-2 py-1">
              6. ยอดซื้อที่มีสิทธินำภาษีซื้อมาหักในการคำนวณภาษีเดือนนี้
            </td>
            <Cell>{formatBaht(filing.purchaseTotal, true)}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">6</td>
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1 font-medium">
              7. ภาษีซื้อเดือนนี้
            </td>
            <Cell>{formatBaht(filing.purchaseVat, true)}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">7</td>
          </tr>

          <tr>
            <td className="border border-neutral/40 px-1 py-1 text-center" rowSpan={3}>
              ภาษี
              <br />
              มูลค่า
              <br />
              เพิ่ม
            </td>
            <td className="border border-neutral/40 px-2 py-1">
              8. ภาษีที่ต้องชำระเดือนนี้ (ถ้า 5. มากกว่า 7.)
            </td>
            <Cell>{field8 > 0 ? formatBaht(field8, true) : ""}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">8</td>
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              9. ภาษีที่ชำระเกินเดือนนี้ (ถ้า 7. น้อยกว่า 5.)
            </td>
            <Cell>{field9 > 0 ? formatBaht(field9, true) : ""}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">9</td>
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              10. ภาษีที่ชำระเกินยกมา
            </td>
            <Cell>{field10 > 0 ? formatBaht(field10, true) : ""}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">10</td>
          </tr>

          <tr>
            <td className="border border-neutral/40 px-1 py-1 text-center" rowSpan={2}>
              ภาษี
              <br />
              สุทธิ
            </td>
            <td className="border border-neutral/40 px-2 py-1 font-medium">
              11. ต้องชำระ (ถ้า 8. มากกว่า 10.)
            </td>
            <Cell>{field11 > 0 ? formatBaht(field11, true) : ""}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">11</td>
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1 font-medium">
              12. ชำระเกิน ((ถ้า 10. มากกว่า 8.) หรือ (9. รวมกับ 10.))
            </td>
            <Cell>{field12 > 0 ? formatBaht(field12, true) : ""}</Cell>
            <td className="border border-neutral/40 px-1 py-1 text-center">12</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-2 text-text-secondary">
        กรณียื่นแบบแสดงรายการและชำระภาษีเกินกำหนดเวลา หรือยื่นเพิ่มเติม: 13.
        เงินเพิ่ม / 14. เบี้ยปรับ / 15. รวมภาษี เงินเพิ่ม และเบี้ยปรับที่ต้อง
        ชำระ / 16. รวมภาษีที่ชำระเกิน — ไม่มีรายการในเดือนนี้
      </p>

      <div className="mt-8 text-center">
        <p>ข้าพเจ้าขอรับรองว่า ข้อความที่แสดงในแบบแสดงรายการนี้ถูกต้องและเป็นความจริงทุกประการ</p>
        <p className="mt-6">ลงชื่อ......................................................ผู้ประกอบการ</p>
        <p className="mt-1">
          ยื่นวันที่{" "}
          {filing.filedDate
            ? new Intl.DateTimeFormat("en-GB").format(new Date(filing.filedDate))
            : "..............................."}
        </p>
      </div>
    </div>
  );
}
