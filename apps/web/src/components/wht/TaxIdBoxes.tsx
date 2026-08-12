/** Renders a 13-digit Thai tax ID as individual boxes, grouped
 * 1-4-5-2-1 to match the official form layout. Blank cells if unset. */
export function TaxIdBoxes({ value }: { value: string | null }) {
  const digits = (value ?? "").replace(/\D/g, "").padEnd(13, " ").slice(0, 13).split("");
  const groups = [1, 4, 5, 2, 1];
  let cursor = 0;

  return (
    <div className="flex items-center gap-1">
      {groups.map((size, gi) => {
        const cells = digits.slice(cursor, cursor + size);
        cursor += size;
        return (
          <div key={gi} className="flex gap-[2px]">
            {cells.map((d, di) => (
              <span
                key={di}
                className="flex h-5 w-4 items-center justify-center border border-neutral/50 text-caption"
              >
                {d.trim()}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
