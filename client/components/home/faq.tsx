"use client";

import React from "react";
import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "What is OpenBook?",
    answer:
      "An open-source research studio in the spirit of NotebookLM. You add sources to a notebook, chat with them, generate study material from them, and listen to an AI debate podcast built from the same library.",
  },
  {
    question: "What can I add as a source?",
    answer:
      "PDFs, web pages, YouTube videos, Google Docs, Notion pages, Markdown, and raw text. Web pages are scraped with Firecrawl and videos come in as transcripts, so both end up searchable like any other document.",
  },
  {
    question: "How do the citations work?",
    answer:
      "Sources are chunked and embedded into Pinecone. Every answer is assembled from the chunks retrieved for your question, and each response carries the citations for exactly those chunks.",
  },
  {
    question: "What is Interrupt & Ask?",
    answer:
      "While an episode is playing you can pause at any timestamp and ask a question. Alex or Jordan answers in character from your sources, then the episode resumes where you left it.",
  },
  {
    question: "Can it search the live web?",
    answer:
      "Yes. Toggle Tavily search in the chat input when a question needs something outside your library, and those results are cited alongside your own sources.",
  },
  {
    question: "Does it remember me between notebooks?",
    answer:
      "Memory keeps a profile of what you are working on and how you like answers framed, so a new notebook does not start from zero. You can inspect and clear it from settings at any time.",
  },
  {
    question: "What is free and what is paid?",
    answer:
      "The free tier covers one workspace with a limited number of messages, sources, and artifacts. Pro and Pro+ raise those limits and unlock podcast generation and interruptions.",
  },
  {
    question: "Is it really open source?",
    answer:
      "Yes. The Next.js client and the Express server both live in the public repository, so you can read it, self-host it, and bring your own API keys.",
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto grid w-full max-w-5xl scroll-mt-24 gap-10 px-5 pt-28 sm:px-6 sm:pt-36 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16"
    >
      <div>
        <h2 className="text-[28px] leading-[1.15] tracking-tight sm:text-[32px]">
          The practical
          <br />
          bits, answered.
        </h2>
        <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
          What OpenBook grounds, what it generates for you, and what stays under your
          control.
        </p>
      </div>

      <Accordion.Root className="flex w-full flex-col">
        {FAQS.map((faq) => (
          <Accordion.Item
            key={faq.question}
            value={faq.question}
            className="border-b border-border"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group/trigger flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                {faq.question}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-aria-expanded/trigger:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Panel className="overflow-hidden data-closed:animate-accordion-up data-open:animate-accordion-down">
              <p className="h-(--accordion-panel-height) max-w-xl pb-5 text-sm leading-relaxed text-muted-foreground data-ending-style:h-0 data-starting-style:h-0">
                {faq.answer}
              </p>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
