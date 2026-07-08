"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Option = { value: string; label: string };

/**
 * Generic single-select list filter for module pages (บันทึกต้นทุน,
 * สรุปค่าแรง, …). Navigates on change, merging into the CURRENT query string
 * (via useSearchParams) rather than replacing it — so multiple independent
 * filters on the same page (e.g. โปรเจค + คนงาน) can be combined without one
 * clearing the other. Choosing the empty/"all" option removes that param.
 */
export function SelectFilterBar({
  basePath,
  label,
  paramName,
  allLabel,
  options,
}: {
  basePath: string;
  label: string;
  paramName: string;
  allLabel: string;
  options: Option[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={`filter-${paramName}`}
        className="text-body-sm text-text-secondary"
      >
        {label}
      </label>
      <select
        id={`filter-${paramName}`}
        value={searchParams.get(paramName) ?? ""}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) {
            params.set(paramName, e.target.value);
          } else {
            params.delete(paramName);
          }
          const qs = params.toString();
          router.push(qs ? `${basePath}?${qs}` : basePath);
        }}
        className="h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
