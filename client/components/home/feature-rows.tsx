import React from "react";
import { AudioLines, Layers, MessageSquareQuote, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShowcaseFrame } from "./showcase-frame";
import { Fade, IconTile, type TileTone } from "./primitives";

interface Feature {
  id: string;
  eyebrow: string;
  /** Headline: lead words, an inline tile, more words, then a faded tail. */
  title: { lead: string; tile: { icon: React.ElementType; tone: TileTone; tilt: number }; rest: string; fade: string };
  body: string;
  chips: string[];
  /** Index of the chip that matches what the screenshot shows, if any. */
  activeChip?: number;
  note: { code: string; text: string };
  image: string;
  alt: string;
  aspect: string;
}

const FEATURES: Feature[] = [
  {
    id: "chat",
    eyebrow: "Grounded chat",
    title: {
      lead: "A cited",
      tile: { icon: MessageSquareQuote, tone: "ink", tilt: -4 },
      rest: "answer,",
      fade: "not a confident guess.",
    },
    body: "Every reply points back to the passage it came from: the page of the PDF, the timestamp in the video, the paragraph on the page. You can check the claim instead of trusting it.",
    chips: ["PDF page", "Video timestamp", "Web paragraph"],
    note: { code: "chat.cite()", text: "Every answer, sourced." },
    image: "/landing/grounded-chat.png",
    // TODO(landing): this screenshot is a coding chat with no citation visible, so it
    // does not show what this row claims. Re-shoot it against a real cited answer and
    // restore an alt that describes the citations.
    alt: "A chat thread in an OpenBook notebook, showing a question and the assistant's reply",
    aspect: "16 / 10",
  },
  {
    id: "sources",
    eyebrow: "Sources",
    title: {
      lead: "Connect the",
      tile: { icon: Plug, tone: "blue", tilt: 4 },
      rest: "sources",
      fade: "your work already uses.",
    },
    body: "Import straight from Google Drive, Notion and GitHub, drop in PDFs or images, paste a URL, or pull a YouTube transcript. Everything lands in one library your notebook can reason over.",
    chips: ["PDF", "Drive", "Notion", "GitHub", "YouTube", "URL"],
    activeChip: 0,
    note: { code: "sources.add()", text: "One library, every format." },
    image: "/landing/source.png",
    alt: "The Add Source dialog, open on the PDF tab, with its drop zone and the other source types across the top",
    aspect: "4 / 3",
  },
  {
    id: "podcast",
    eyebrow: "Debate podcast",
    title: {
      lead: "A podcast",
      tile: { icon: AudioLines, tone: "red", tilt: -3 },
      rest: "you can",
      fade: "interrupt mid-sentence.",
    },
    body: "Alex and Jordan debate your sources out loud. Pause the episode at any timestamp, ask a question, and hear an in-character answer grounded in your notes before the show picks back up.",
    chips: ["Listen", "Interrupt", "Ask"],
    activeChip: 1,
    note: { code: "podcast.interrupt()", text: "Then the show resumes." },
    image: "/landing/podcast.png",
    alt: "An AI debate podcast episode hosted by Alex and Jordan, with an Interrupt and Ask button beside the player",
    aspect: "16 / 10",
  },
  {
    id: "studio",
    eyebrow: "Studio",
    title: {
      lead: "Flashcards,",
      tile: { icon: Layers, tone: "green", tilt: 4 },
      rest: "quizzes,",
      fade: "and mind maps on tap.",
    },
    body: "Studio turns the same library into summaries, key takeaways, flashcards, practice quizzes, and mind maps. Memory remembers how you like to learn, and you can export any artifact to Notion.",
    chips: ["Summary", "Flashcards", "Quiz", "Mind map"],
    activeChip: 3,
    note: { code: "studio.generate()", text: "Export any artifact to Notion." },
    image: "/landing/studio.png",
    // TODO(landing): this row promises flashcards, quizzes and mind maps but the
    // screenshot shows only a mind map. Re-shoot against the Studio panel.
    alt: "A mind map generated from a notebook's sources, its branches expanded across the canvas",
    aspect: "16 / 10",
  },
];

export function FeatureRows() {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-6">
      {FEATURES.map((feature, index) => {
        const imageFirst = index % 2 === 1;
        const { icon: TileIcon, tone, tilt } = feature.title.tile;

        return (
          <section
            key={feature.id}
            id={feature.id}
            aria-labelledby={`${feature.id}-title`}
            className="grid scroll-mt-28 items-center gap-10 pt-32 sm:pt-40 lg:grid-cols-[0.82fr_1fr] lg:gap-14"
          >
            <div className={cn(imageFirst && "lg:order-2")}>
              <p className="text-[15px] text-muted-foreground">{feature.eyebrow}</p>
              <h2
                id={`${feature.id}-title`}
                className="mt-2.5 text-[clamp(36px,4.4vw,60px)] leading-[1.16] font-semibold tracking-[-0.035em] text-balance"
              >
                {feature.title.lead}{" "}
                <IconTile tone={tone} tilt={tilt}>
                  <TileIcon strokeWidth={2.2} />
                </IconTile>{" "}
                {feature.title.rest} <Fade>{feature.title.fade}</Fade>
              </h2>
              <p className="mt-6 max-w-[440px] text-[18px] leading-[1.6] text-muted-foreground">
                {feature.body}
              </p>

              {/* Segmented chip row, read-only: it labels what the feature covers. */}
              <ul className="mt-8 inline-flex max-w-full flex-wrap gap-1 rounded-[22px] bg-muted/60 p-1 dark:bg-muted/70">
                {feature.chips.map((chip, chipIndex) => (
                  <li
                    key={chip}
                    className={cn(
                      "flex h-10 items-center rounded-full px-4 text-[14px] font-medium",
                      chipIndex === feature.activeChip
                        ? "bg-foreground text-background"
                        : "text-foreground/80"
                    )}
                  >
                    {chip}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[14px] text-muted-foreground">
                <code className="font-mono text-[13px] text-foreground">{feature.note.code}</code>{" "}
                {feature.note.text}
              </p>
            </div>

            <ShowcaseFrame
              src={feature.image}
              alt={feature.alt}
              aspect={feature.aspect}
              className={cn(imageFirst && "lg:order-1")}
            />
          </section>
        );
      })}
    </div>
  );
}
