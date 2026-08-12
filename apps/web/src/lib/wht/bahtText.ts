const DIGITS = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const PLACES = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

/** Convert a non-negative integer under 6 digits (0-999999) to Thai text. */
function integerToThai(n: number): string {
  if (n === 0) return "";
  const digits = String(n).split("").map(Number);
  const len = digits.length;
  let out = "";

  for (let i = 0; i < len; i++) {
    const digit = digits[i]!;
    const place = len - i - 1; // 0 = ones, 1 = tens, 2 = hundreds, ...
    if (digit === 0) continue;

    if (place === 0 && digit === 1 && len > 1) {
      out += "เอ็ด";
    } else if (place === 1 && digit === 2) {
      out += "ยี่" + PLACES[1];
    } else if (place === 1 && digit === 1) {
      out += PLACES[1];
    } else {
      out += DIGITS[digit] + (PLACES[place] ?? "");
    }
  }
  return out;
}

/** Full non-negative integer of any size, grouped by ล้าน (millions). */
function bigIntegerToThai(n: number): string {
  if (n === 0) return "ศูนย์";
  const millionGroups: number[] = [];
  let rest = n;
  do {
    millionGroups.unshift(rest % 1_000_000);
    rest = Math.floor(rest / 1_000_000);
  } while (rest > 0);

  return millionGroups
    .map((group, idx) => {
      const isLast = idx === millionGroups.length - 1;
      const text = integerToThai(group);
      if (!text) return "";
      return text + (isLast ? "" : "ล้าน");
    })
    .join("");
}

/** Format a THB amount as Thai text, e.g. 300 -> "สามร้อยบาทถ้วน". */
export function bahtText(amount: number): string {
  const rounded = Math.round(Math.abs(amount) * 100) / 100;
  const baht = Math.floor(rounded);
  const satang = Math.round((rounded - baht) * 100);

  const bahtPart = baht > 0 || satang === 0 ? bigIntegerToThai(baht) + "บาท" : "";
  const satangPart = satang > 0 ? bigIntegerToThai(satang) + "สตางค์" : "ถ้วน";

  return `${bahtPart}${satangPart}`;
}
