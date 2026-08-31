import React from "react";

const COLUMNS = [
  {
    label: "connected sources",
    title: "Where did this claim come from?",
    body: "PDFs, web articles, YouTube transcripts, Google Docs, and Notion pages each hold one piece of the answer, and none of them tell you which piece matters.",
  },
  {
    label: "openbook.chat()",
    title: "What should the model actually read?",
    body: "OpenBook retrieves the passages that answer your question, keeps them inside the context budget, and hands the model one grounded set of evidence.",
  },
];

export function GroundingIntro() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pt-28 sm:px-6 sm:pt-36">
      <div className="max-w-xl">
        <h2 className="text-[30px] leading-[1.15] tracking-tight sm:text-[34px]">
          Your sources are uploaded.
          <br />
          Your answers still need proof.
        </h2>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Chat gives you fluent text. Search gives you raw hits. OpenBook reads across
          your whole library, picks the passages that actually answer the question, and
          cites every one of them.
        </p>
      </div>

      <div className="mt-20 grid gap-x-16 gap-y-12 sm:grid-cols-2">
        {COLUMNS.map((column) => (
          <div key={column.label}>
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground/60">
              {column.label}
            </p>
            <h3 className="mt-4 text-[17px] tracking-tight">{column.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {column.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
