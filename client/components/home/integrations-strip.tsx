import React from "react";
import Image from "next/image";
import {
  AudioLines,
  Brain,
  Database,
  Flame,
  Globe,
  Search,
} from "lucide-react";
import { YoutubeIcon } from "@/components/ui/youtube-icon";
import { GithubIcon } from "./brand-icons";

const INTEGRATIONS: { label: string; icon: React.ReactNode }[] = [
  {
    label: "Google Drive",
    icon: <Image src="/integrations/google-drive-logo.png" alt="" width={18} height={18} className="size-4.5 object-contain" />,
  },
  {
    label: "Notion",
    icon: (
      <>
        <Image src="/integrations/notion-logo.webp" alt="" width={18} height={18} className="dark:hidden" />
        <Image src="/integrations/notion-logo-white.webp" alt="" width={18} height={18} className="hidden dark:block" />
      </>
    ),
  },
  { label: "YouTube", icon: <YoutubeIcon size={18} /> },
  { label: "GitHub", icon: <GithubIcon className="size-4.5" /> },
  { label: "Firecrawl", icon: <Flame className="size-4.5 text-[#f26b1d]" strokeWidth={2} /> },
  { label: "Tavily", icon: <Search className="size-4.5 text-[#3b6fe0]" strokeWidth={2} /> },
  { label: "Pinecone", icon: <Database className="size-4.5" strokeWidth={2} /> },
  { label: "ElevenLabs", icon: <AudioLines className="size-4.5" strokeWidth={2} /> },
  { label: "Mem0", icon: <Brain className="size-4.5 text-[#8b5cf6]" strokeWidth={2} /> },
  { label: "Web pages", icon: <Globe className="size-4.5" strokeWidth={2} /> },
];

export function IntegrationsStrip() {
  return (
    <section className="pt-24 sm:pt-28" aria-labelledby="integrations-heading">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-baseline justify-between gap-2 px-5 sm:px-6">
        <p id="integrations-heading" className="text-[15px] text-muted-foreground">
          Works with the tools your research already lives in
        </p>
        <p className="font-mono text-[12px] text-muted-foreground/70">
          more connectors shipping
        </p>
      </div>

      <div className="relative mx-auto mt-6 max-w-[1240px] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="marquee-track flex w-max items-center gap-2.5 py-1 pr-2.5">
          {[...INTEGRATIONS, ...INTEGRATIONS].map((item, index) => (
            <li
              key={`${item.label}-${index}`}
              aria-hidden={index >= INTEGRATIONS.length}
              className="flex h-11 shrink-0 items-center gap-2.5 rounded-[14px] bg-card px-4 text-[14.5px] font-medium shadow-[0_1px_2px_rgb(0_0_0/0.04)] ring-1 ring-border/60"
            >
              {item.icon}
              {item.label}
              <span className="size-1.5 rounded-full bg-[#3fae5a]" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
