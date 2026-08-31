import React from "react";
import {
  AudioLines,
  Brain,
  Database,
  FileText,
  Flame,
  Globe,
  HardDrive,
  Search,
} from "lucide-react";
import { YoutubeIcon } from "@/components/ui/youtube-icon";

const INTEGRATIONS: { label: string; icon: React.ReactNode }[] = [
  { label: "Google Drive", icon: <HardDrive className="size-5" strokeWidth={1.75} /> },
  { label: "Notion", icon: <FileText className="size-5" strokeWidth={1.75} /> },
  { label: "YouTube", icon: <YoutubeIcon size={20} /> },
  { label: "Firecrawl", icon: <Flame className="size-5" strokeWidth={1.75} /> },
  { label: "Tavily", icon: <Search className="size-5" strokeWidth={1.75} /> },
  { label: "Pinecone", icon: <Database className="size-5" strokeWidth={1.75} /> },
  { label: "ElevenLabs", icon: <AudioLines className="size-5" strokeWidth={1.75} /> },
  { label: "Mem0", icon: <Brain className="size-5" strokeWidth={1.75} /> },
  { label: "Web pages", icon: <Globe className="size-5" strokeWidth={1.75} /> },
];

export function IntegrationsStrip() {
  return (
    <section className="pt-28 sm:pt-36">
      <div className="mx-auto w-full max-w-5xl px-5 text-center sm:px-6">
        <p className="text-[15px] text-foreground">
          Bring in the sources and tools your research already lives in.
        </p>
        <p className="mt-2 text-[13px] text-muted-foreground/70">
          More connectors are being added continuously.
        </p>
      </div>

      <div className="relative mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]">
        <div className="marquee-track flex w-max items-center gap-14 pr-14">
          {[...INTEGRATIONS, ...INTEGRATIONS].map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              aria-hidden={index >= INTEGRATIONS.length}
              className="flex shrink-0 items-center gap-2.5 text-[21px] font-medium tracking-tight text-muted-foreground/55"
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
