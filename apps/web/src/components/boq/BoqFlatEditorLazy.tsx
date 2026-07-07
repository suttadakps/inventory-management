import dynamic from "next/dynamic";

function EditorSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-11 w-full max-w-md rounded-md bg-[#e7e1d5]" />
      <div className="overflow-hidden rounded-lg border border-[#ece7db] bg-white shadow-1">
        <div className="h-11 border-b border-[#f0ece2] bg-[#faf8f3]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-[#f0ece2] last:border-0" />
        ))}
      </div>
      <div className="h-10 w-32 rounded-md bg-[#e7e1d5]" />
    </div>
  );
}

/**
 * Code-split wrapper around BoqFlatEditor (the largest client component in
 * the app, ~500 lines of interactive line-item/milestone/VAT UI). Splitting
 * it into its own chunk keeps the rest of the BOQ page (header, workflow
 * buttons) interactive without waiting on the editor's JS, and shows a
 * lightweight skeleton in its place while that chunk streams in.
 */
export const BoqFlatEditorLazy = dynamic(
  () => import("./BoqFlatEditor").then((m) => m.BoqFlatEditor),
  { loading: () => <EditorSkeleton /> }
);
