import Image from "next/image";

import type { WhtCertificateItem } from "@/lib/wht/repository";
import { formatBaht } from "@/lib/format";
import { bahtText } from "@/lib/wht/bahtText";
import { PrintButton } from "@/components/boq/PrintButton";
import { TaxIdBoxes } from "@/components/wht/TaxIdBoxes";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const COMPANY_NAME = "บจก.อาร์ติเวอร์จ เน็กส์ จำกัด";
const COMPANY_ADDRESS =
  "23/71 หมู่บ้านพิศาล ประชาอุทิศ ถนนเลียบทางด่วน เขตทุ่งครุ แขวงทุ่งครุ กรุงเทพ 10140";

const WITHHOLDING_LABELS: Record<string, string> = {
  "1": "หัก ณ ที่จ่าย",
  "2": "ออกให้ตลอดไป",
  "3": "ออกให้ครั้งเดียว",
  "4": "อื่นๆ",
};

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className="inline-flex h-3.5 w-3.5 items-center justify-center border border-neutral/60 text-caption leading-none">
      {checked ? "✓" : ""}
    </span>
  );
}

function fmtDate(iso: string | null): string {
  return iso ? dateFmt.format(new Date(iso)) : "";
}

/** Row 5/6 dynamic cell content — blank unless this row matches the
 * certificate's incomeCategory. */
function IncomeRowValues({
  cert,
  category,
}: {
  cert: WhtCertificateItem;
  category: string;
}) {
  if (cert.incomeCategory !== category) {
    return (
      <>
        <td className="border border-neutral/40 px-2 py-1" />
        <td className="border border-neutral/40 px-2 py-1" />
        <td className="border border-neutral/40 px-2 py-1" />
      </>
    );
  }
  return (
    <>
      <td className="border border-neutral/40 px-2 py-1 text-center tabular-nums">
        {fmtDate(cert.paymentDate)}
      </td>
      <td className="border border-neutral/40 px-2 py-1 text-right tabular-nums">
        {formatBaht(cert.amountPaid, true)}
      </td>
      <td className="border border-neutral/40 px-2 py-1 text-right tabular-nums">
        {formatBaht(cert.taxWithheld, true)}
      </td>
    </>
  );
}

export function WhtCertificateDocument({ cert }: { cert: WhtCertificateItem }) {
  return (
    <div className="mx-auto max-w-3xl bg-white p-6 text-caption text-text-primary print:p-0">
      <div className="mb-2 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="mb-1 flex items-start justify-between">
        <div className="flex-1 text-center">
          <h1 className="text-body font-bold">หนังสือรับรองการหักภาษี ณ ที่จ่าย</h1>
          <p>ตามมาตรา 50 ทวิแห่งประมวลรัษฎากร</p>
        </div>
        <div className="w-28 shrink-0 text-right">
          <div>เล่มที่ {cert.bookNo || "......."}</div>
          <div>เลขที่ {cert.docNo || "......."}</div>
        </div>
      </div>
      <p className="mb-3">
        แบบยื่น {cert.filingForm === "pnd53" ? "ภ.ง.ด.53" : "ภ.ง.ด.3"}
      </p>

      <div className="mb-3 space-y-1 border border-neutral/40 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">ผู้มีหน้าที่หักภาษี ณ ที่จ่าย : -</span>
          <span>เลขประจำตัวผู้เสียภาษี</span>
          <TaxIdBoxes value={cert.payerTaxId} />
        </div>
        <div>ชื่อ {COMPANY_NAME}</div>
        <div>ที่อยู่ {COMPANY_ADDRESS}</div>
      </div>

      <div className="mb-3 space-y-1 border border-neutral/40 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">ผู้ถูกหักภาษี ณ ที่จ่าย : -</span>
          <span>เลขประจำตัวผู้เสียภาษี</span>
          <TaxIdBoxes value={cert.payeeTaxId} />
        </div>
        <div>ชื่อ {cert.payeeName}</div>
        <div>ที่อยู่ {cert.payeeAddress || ""}</div>
      </div>

      <table className="w-full border-collapse text-caption">
        <thead>
          <tr>
            <th className="border border-neutral/40 px-2 py-1 text-left">
              ประเภทเงินได้พึงประเมินที่จ่าย
            </th>
            <th className="w-20 border border-neutral/40 px-2 py-1">
              วันเดือนหรือปีภาษีที่จ่าย
            </th>
            <th className="w-24 border border-neutral/40 px-2 py-1">
              จำนวนเงินที่จ่าย
            </th>
            <th className="w-24 border border-neutral/40 px-2 py-1">
              ภาษีที่หักและนำส่งไว้
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              1. เงินเดือน ค่าจ้าง เบี้ยเลี้ยง โบนัส ฯลฯ ตามมาตรา 40 (1)
            </td>
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1" />
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              2. ค่าธรรมเนียม ค่านายหน้า ฯลฯ ตามมาตรา 40 (2)
            </td>
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1" />
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              3. ค่าแห่งลิขสิทธิ์ฯลฯ ตามมาตรา 40 (3)
            </td>
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1" />
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1 align-top">
              <p>4. (ก) ดอกเบี้ย ฯลฯ ตามมาตรา 40 (4) (ก)</p>
              <p>(ข) เงินปันผล เงินส่วนแบ่งกำไร ฯลฯ ตามมาตรา 40 (4) (ข)</p>
              <p className="pl-3">
                (1) กรณีผู้ได้รับเงินปันผลได้รับเครดิตภาษี โดยจ่ายจากกำไรสุทธิของกิจการที่ต้องเสียภาษีเงินได้นิติบุคคลในอัตราดังนี้
              </p>
              <p className="pl-6">(1.1) อัตราร้อยละ 30 ของกำไรสุทธิ</p>
              <p className="pl-6">(1.2) อัตราร้อยละ 25 ของกำไรสุทธิ</p>
              <p className="pl-6">(1.3) อัตราร้อยละ 20 ของกำไรสุทธิ</p>
              <p className="pl-6">(1.4) อัตราอื่นๆ (ระบุ)....................ของกำไรสุทธิ</p>
              <p className="pl-3">
                (2) กรณีผู้ได้รับเงินปันผลไม่ได้รับเครดิตภาษี เนื่องจากจ่ายจาก
              </p>
              <p className="pl-6">
                (2.1) กำไรสุทธิของกิจการที่ได้รับยกเว้นภาษีเงินได้นิติบุคคล
              </p>
              <p className="pl-6">
                (2.2) เงินปันผลหรือส่วนแบ่งของกำไรที่ได้รับยกเว้นไม่ต้องนำมารวมคำนวณเป็นรายได้เพื่อเสียภาษีเงินได้นิติบุคคล
              </p>
              <p className="pl-6">
                (2.3) กำไรสุทธิส่วนที่ได้หักผลขาดทุนสุทธิยกมาไม่เกิน 5 ปีก่อนรอบระยะเวลาบัญชีปีปัจจุบัน
              </p>
              <p className="pl-6">
                (2.4) กำไรที่รับรู้ทางบัญชีโดยวิธีส่วนได้ส่วนเสีย (equity method)
              </p>
              <p className="pl-6">(2.5) อื่นๆ (ระบุ) ..................................</p>
            </td>
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1" />
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1 align-top">
              <p>
                5. การจ่ายเงินได้ที่ต้องหักภาษี ณ ที่จ่าย ตามคำสั่งกรมสรรพากรที่ออกตามมาตรา 3 เตรส (ระบุ)
                {cert.incomeCategory === "5" ? cert.incomeDescription : "...."}
              </p>
              <p className="text-text-secondary">
                ( เช่น รางวัล ส่วนลดหรือประโยชน์ใดๆ เนื่องจากการส่งเสริมการขาย
                รางวัลในการประกวด การแข่งขัน การชิงโชค ค่าแสดงของนักแสดงสาธารณะ
                ค่าจ้างทำของ ค่าโฆษณา ค่าเช่า ค่าขนส่ง ค่าบริการ
                ค่าเบี้ยประกันวินาศภัย ฯลฯ )
              </p>
            </td>
            <IncomeRowValues cert={cert} category="5" />
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1">
              6. อื่นๆ {cert.incomeCategory === "6" ? cert.incomeDescription : "..."}
            </td>
            <IncomeRowValues cert={cert} category="6" />
          </tr>
          <tr>
            <td className="border border-neutral/40 px-2 py-1 text-center font-medium">
              รวมเงินที่จ่ายและภาษีที่หักนำส่ง
            </td>
            <td className="border border-neutral/40 px-2 py-1" />
            <td className="border border-neutral/40 px-2 py-1 text-right font-medium tabular-nums">
              {formatBaht(cert.amountPaid, true)}
            </td>
            <td className="border border-neutral/40 px-2 py-1 text-right font-medium tabular-nums">
              {formatBaht(cert.taxWithheld, true)}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-2 flex flex-wrap items-center gap-2 border border-neutral/40 p-2">
        <span className="font-medium">รวมเงินภาษีที่หักนำส่ง (ตัวอักษร)</span>
        <span>{bahtText(cert.taxWithheld)}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <span className="font-medium">ผู้จ่ายเงิน</span>
        {(["1", "2", "3", "4"] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1">
            <Checkbox checked={cert.withholdingType === k} />({k}) {WITHHOLDING_LABELS[k]}
            {k === "4" && cert.withholdingType === "4" && cert.withholdingOther
              ? ` (${cert.withholdingOther})`
              : k === "4"
                ? " (ระบุ)........."
                : ""}
          </span>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p>ขอรับรองว่าข้อความและตัวเลขดังกล่าวข้างต้นถูกต้องตรงกับความจริงทุกประการ</p>
        <p className="mt-6">ลงชื่อ......................................................ผู้จ่ายเงิน</p>
        <p className="mt-1">{cert.signerName || ""}</p>
        <p>กรรมการผู้มีอำนาจลงนาม</p>
        <p>( วันที่ {fmtDate(cert.signedDate) || "..............................."} )</p>
      </div>
    </div>
  );
}
