import React from "react";
import { cn } from "@/lib/utils";
import { ShowcaseFrame, type FrameTone } from "./showcase-frame";

interface Feature {
  id: string;
  title: [string, string];
  body: string;
  image: string;
  alt: string;
  tone: FrameTone;
  aspect: string;
}

const FEATURES: Feature[] = [
  {
    id: "chat",
    title: ["A cited answer,", "not a confident guess."],
    body: "Every reply points back to the passage it came from — the page of the PDF, the timestamp in the video, the paragraph on the page. You can check the claim instead of trusting it.",
    image: "/landing/grounded-chat.png",
    alt: "Grounded chat answering a question with inline citations from the notebook's sources",
    tone: "sand",
    aspect: "16 / 10",
  },
  {
    id: "sources",
    title: ["Connect the sources", "your work already uses."],
    body: "Import straight from Google Drive and Notion, drop in PDFs, paste a URL, or pull a YouTube transcript. Everything lands in one library your notebook can reason over.",
    image: "/landing/source.png",
    alt: "The sources library showing PDFs, web pages, and YouTube videos imported into a notebook",
    tone: "violet",
    aspect: "4 / 3",
  },
  {
    id: "podcast",
    title: ["A podcast you can", "interrupt mid-sentence."],
    body: "Alex and Jordan debate your sources out loud. Pause the episode at any timestamp, ask a question, and hear an in-character answer grounded in your notes before the show picks back up.",
    image: "/landing/podcast.png",
    alt: "An AI debate podcast episode paused mid-play with an Interrupt and Ask question",
    tone: "green",
    aspect: "16 / 10",
  },
  {
    id: "studio",
    title: ["Flashcards, quizzes,", "and mind maps on tap."],
    body: "Studio turns the same library into summaries, key takeaways, flashcards, practice quizzes, and mind maps. Memory remembers how you like to learn, and you can export any artifact to Notion.",
    image: "/landing/studio.png",
    alt: "Studio panel generating flashcards, a quiz, and a mind map from the notebook's sources",
    tone: "blue",
    aspect: "16 / 10",
  },
];

export function FeatureRows() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 sm:px-6">
      {FEATURES.map((feature, index) => {
        const imageFirst = index % 2 === 1;

        return (
          <section
            key={feature.id}
            id={feature.id}
            className="grid scroll-mt-24 items-center gap-10 pt-28 sm:pt-36 lg:grid-cols-2 lg:gap-16"
          >
            <div className={cn(imageFirst && "lg:order-2")}>
              <h2 className="text-[28px] leading-[1.15] tracking-tight sm:text-[32px]">
                {feature.title[0]}
                <br />
                {feature.title[1]}
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </div>

            <ShowcaseFrame
              src={feature.image}
              alt={feature.alt}
              tone={feature.tone}
              aspect={feature.aspect}
              className={cn(imageFirst && "lg:order-1")}
            />
          </section>
        );
      })}
    </div>
  );
}
