"use client";

import React from "react";
import { Accordion } from "@base-ui/react/accordion";
import { Plus } from "lucide-react";
import { SectionHeading } from "./primitives";

const FAQS = [
  {
    question: "What is OpenBook?",
    answer:
      "An open-source research studio in the spirit of NotebookLM. You add sources to a notebook, chat with them, generate study material from them, and listen to an AI debate podcast built from the same library.",
  },
  {
    question: "What can I add as a source?",
    answer:
      "PDFs, images, web pages, YouTube videos, Google Docs, Notion pages, GitHub repositories, Markdown, and raw text. Web pages are scraped with Firecrawl and videos come in as transcripts, so both end up searchable like any other document.",
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
      aria-labelledby="faq-title"
      className="mx-auto w-full max-w-[880px] scroll-mt-28 px-5 pt-32 sm:px-6 sm:pt-44"
    >
      <SectionHeading id="faq-title" eyebrow="FAQ" align="center" size="lg">
        Questions.
      </SectionHeading>

      <Accordion.Root className="mt-14 flex w-full flex-col gap-2">
        {FAQS.map((faq) => (
          <Accordion.Item
            key={faq.question}
            value={faq.question}
            className="rounded-[20px] bg-muted/60 transition-colors data-open:bg-muted dark:bg-muted/70"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group/trigger flex w-full items-center justify-between gap-6 rounded-[20px] px-6 py-5 text-left text-[17px] font-semibold tracking-[-0.01em] outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                {faq.question}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card transition-transform duration-200 ease-out group-aria-expanded/trigger:rotate-45">
                  <Plus className="size-4" strokeWidth={2.2} />
                </span>
              </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
              <p className="max-w-[640px] px-6 pb-6 text-[15.5px] leading-[1.6] text-muted-foreground">
                {faq.answer}
              </p>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
