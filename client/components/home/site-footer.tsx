import React from "react";
import Link from "next/link";
import { OpenBookLogo } from "@/features/auth";
import { GithubIcon } from "./brand-icons";
import { DOCS_URL, GITHUB_URL } from "./links";

interface FooterLink {
  label: string;
  href?: string;
  external?: boolean;
  soon?: boolean;
}

const FOOTER_COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Platform",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Notebooks", href: "/dashboard" },
      { label: "Sources", href: "#sources" },
      { label: "Studio", href: "#studio" },
      { label: "Memory", href: "/settings/memory" },
    ],
  },
  {
    heading: "Use cases",
    links: [
      { label: "Grounded chat", href: "#chat" },
      { label: "Study artifacts", href: "#studio" },
      { label: "Debate podcasts", href: "#podcast" },
      { label: "Reports", soon: true },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: DOCS_URL, external: true },
      { label: "Integrations", href: "/settings/integrations" },
      { label: "FAQ", href: "#faq" },
      { label: "API reference", soon: true },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About OpenBook", href: DOCS_URL, external: true },
      { label: "GitHub", href: GITHUB_URL, external: true },
    ],
  },
];

function FooterItem({ link }: { link: FooterLink }) {
  const className =
    "text-[13.5px] text-muted-foreground transition-colors hover:text-foreground";

  if (link.soon || !link.href) {
    return (
      <span className="inline-flex items-center gap-2 text-[13.5px] whitespace-nowrap text-muted-foreground/60">
        {link.label}
        <span className="rounded-full border border-border px-1.5 py-px text-[10px] tracking-wide text-muted-foreground/60">
          Soon
        </span>
      </span>
    );
  }

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="px-4 pt-28 pb-5 sm:px-6 sm:pt-36">
      <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-border bg-card px-7 py-12 sm:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_2.3fr]">
          <Link href="/" className="flex h-fit items-center" aria-label="OpenBook home">
            <OpenBookLogo size={24} textSize="text-xl" />
          </Link>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="text-xs text-muted-foreground/55">{column.heading}</p>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterItem link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-[13px] text-muted-foreground/60">
            &copy; {new Date().getFullYear()} OpenBook
          </p>

          <div className="flex items-center gap-4">
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[13px] text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              Docs
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="OpenBook on GitHub"
              className="text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <GithubIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
