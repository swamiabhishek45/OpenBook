"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language?: string;
  code: string;
}

function highlightCode(code: string, language: string = "code"): React.ReactNode {
  const lines = code.split("\n");

  const highlightLine = (line: string, lineIdx: number) => {
    const commentMatch = line.match(/^(\s*)((\/\/|#).*)$/);
    if (commentMatch) {
      return (
        <span key={lineIdx}>
          {commentMatch[1]}
          <span className="text-zinc-500 dark:text-zinc-400 italic">
            {commentMatch[2]}
          </span>
          {"\n"}
        </span>
      );
    }

    const tokenRegex =
      /(\/\/.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b(?:const|let|var|function|return|import|export|from|default|class|extends|if|else|switch|case|for|while|try|catch|finally|async|await|new|typeof|instanceof|void|interface|type|enum|public|private|protected|npm|npx|node|cd|mkdir|git|install|run|def|print|self|True|False|None)\b)|(\b(?:true|false|null|undefined|NaN|Infinity|\d+(?:\.\d+)?)\b)|(\b(?:require|console|log|error|warn|send|json|status|listen|use|get|post|put|delete|push|map|filter|reduce|find|forEach)\b)|([{}()[\],;.:=><!+\-*/%&|^?~]+)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }

      const [full, comment, str, keyword, literal, fn, operator] = match;

      if (comment) {
        parts.push(
          <span key={match.index} className="text-zinc-500 dark:text-zinc-400 italic">
            {comment}
          </span>,
        );
      } else if (str) {
        parts.push(
          <span key={match.index} className="text-emerald-800 dark:text-emerald-400 font-normal">
            {str}
          </span>,
        );
      } else if (keyword) {
        parts.push(
          <span key={match.index} className="text-foreground font-semibold">
            {keyword}
          </span>,
        );
      } else if (literal) {
        parts.push(
          <span key={match.index} className="text-amber-800 dark:text-amber-400 font-medium">
            {literal}
          </span>,
        );
      } else if (fn) {
        parts.push(
          <span key={match.index} className="text-foreground/90 font-medium">
            {fn}
          </span>,
        );
      } else if (operator) {
        parts.push(
          <span key={match.index} className="text-muted-foreground font-normal">
            {operator}
          </span>,
        );
      } else {
        parts.push(full);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    return (
      <span key={lineIdx}>
        {parts}
        {"\n"}
      </span>
    );
  };

  return lines.map((line, idx) => highlightLine(line, idx));
}

function CodeBlock({ language = "code", code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLanguage = language.trim() || "code";

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-300/80 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-xs">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-200/80 dark:bg-zinc-900 border-b border-zinc-300/80 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-400 select-none">
        <div className="flex items-center gap-1.5 font-medium lowercase">
          <Terminal className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
          <span>{displayLanguage}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700/80 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all text-[11px] font-medium cursor-pointer shadow-2xs"
          title="Copy"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="px-5 py-4.5 overflow-x-auto font-mono text-[13px] leading-6 bg-zinc-100 dark:bg-zinc-950">
        <pre className="m-0 p-0 font-mono">
          <code>{highlightCode(code, displayLanguage)}</code>
        </pre>
      </div>
    </div>
  );
}

function parseFenceBlock(block: string): {
  language: string;
  code: string;
} | null {
  if (!block.startsWith("```")) return null;
  const inner = block.slice(3);
  const firstLineEnd = inner.indexOf("\n");
  if (firstLineEnd !== -1) {
    return {
      language: inner.slice(0, firstLineEnd).trim(),
      code: inner.slice(firstLineEnd + 1).replace(/```$/, "").trimEnd(),
    };
  }
  return { language: "", code: inner.replace(/```$/, "").trimEnd() };
}

/**
 * Parses markdown inline elements: bold, italic, inline code, links, citations [1]
 */
function renderInlineText(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 mx-0.5 rounded-md bg-muted border border-border font-mono text-[12px] text-foreground font-medium"
        >
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    const boldMatch = remaining.match(/^(\*\*|__)(.*?)\1/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {renderInlineText(boldMatch[2])}
        </strong>,
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^(\*|_)(.*?)\1/);
    if (italicMatch && !italicMatch[2].startsWith("*")) {
      parts.push(
        <em key={key++} className="italic text-foreground/90">
          {renderInlineText(italicMatch[2])}
        </em>,
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer noopener"
          className="text-primary underline underline-offset-2 hover:opacity-80 font-medium"
        >
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    const citationMatch = remaining.match(/^\[(\d+(?:,\s*\d+)*)\]/);
    if (citationMatch) {
      parts.push(
        <span
          key={key++}
          className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 text-[10px] font-mono font-medium rounded-full bg-primary/10 text-primary border border-primary/20 align-baseline cursor-default select-none"
          title={`Source Citation ${citationMatch[1]}`}
        >
          {citationMatch[1]}
        </span>,
      );
      remaining = remaining.slice(citationMatch[0].length);
      continue;
    }

    const nextSpecial = remaining.search(/[`*_[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

interface ChatMarkdownProps {
  content: string;
  className?: string;
  /** When true, the last fenced code block renders in streaming mode. */
  isStreaming?: boolean;
}

function splitStreamingFences(content: string) {
  const lastFence = content.lastIndexOf("```");
  if (lastFence === -1) {
    return { body: content, openFence: null as string | null };
  }

  const afterOpen = content.slice(lastFence + 3);
  if (afterOpen.includes("```")) {
    return { body: content, openFence: null };
  }

  return {
    body: content.slice(0, lastFence),
    openFence: content.slice(lastFence),
  };
}

export function ChatMarkdown({
  content,
  className,
  isStreaming = false,
}: ChatMarkdownProps) {
  if (!content) return null;

  const { body, openFence } = isStreaming
    ? splitStreamingFences(content)
    : { body: content, openFence: null };

  const closedFenceBlocks = body.split(/(```[\s\S]*?```)/g);

  const blocks: React.ReactNode[] = [];

  closedFenceBlocks.forEach((block, bIdx) => {
    if (block.startsWith("```") && block.endsWith("```")) {
      const parsed = parseFenceBlock(block);
      if (!parsed) return;

      blocks.push(
        <CodeBlock
          key={`code-${bIdx}`}
          language={parsed.language || "code"}
          code={parsed.code}
        />,
      );
      return;
    }

    if (!block.trim()) return;

    const lines = block.split(/\r?\n/);
    const elements: React.ReactNode[] = [];
    let listBuffer: {
      type: "ol" | "ul";
      items: { num?: string; text: string }[];
    } | null = null;

    const flushList = () => {
      if (!listBuffer) return;
      const { type, items } = listBuffer;
      if (type === "ol") {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2.5 space-y-1.5 pl-1">
            {items.map((it, idx) => (
              <li key={idx} className="flex items-baseline gap-2 text-foreground/90">
                <span className="font-mono text-xs font-semibold text-muted-foreground shrink-0 select-none">
                  {it.num || `${idx + 1}.`}
                </span>
                <div className="flex-1">{renderInlineText(it.text)}</div>
              </li>
            ))}
          </ol>,
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2.5 space-y-1.5 pl-1">
            {items.map((it, idx) => (
              <li key={idx} className="flex items-baseline gap-2.5 text-foreground/90">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 shrink-0 mt-1.5 select-none" />
                <div className="flex-1">{renderInlineText(it.text)}</div>
              </li>
            ))}
          </ul>,
        );
      }
      listBuffer = null;
    };

    lines.forEach((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList();
        return;
      }

      if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(
          <h3
            key={`h3-${lIdx}`}
            className="text-base font-semibold text-foreground mt-4 mb-1.5 tracking-tight"
          >
            {renderInlineText(trimmed.slice(4))}
          </h3>,
        );
        return;
      }
      if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(
          <h2
            key={`h2-${lIdx}`}
            className="text-lg font-bold text-foreground mt-5 mb-2 tracking-tight"
          >
            {renderInlineText(trimmed.slice(3))}
          </h2>,
        );
        return;
      }
      if (trimmed.startsWith("# ")) {
        flushList();
        elements.push(
          <h1
            key={`h1-${lIdx}`}
            className="text-xl font-bold text-foreground mt-6 mb-2.5 tracking-tight"
          >
            {renderInlineText(trimmed.slice(2))}
          </h1>,
        );
        return;
      }

      const olMatch = line.match(/^\s*(\d+[\.\)])\s+(.*)$/);
      if (olMatch) {
        if (!listBuffer || listBuffer.type !== "ol") {
          flushList();
          listBuffer = { type: "ol", items: [] };
        }
        listBuffer.items.push({ num: olMatch[1], text: olMatch[2] });
        return;
      }

      const ulMatch = line.match(/^\s*[-*•]\s+(.*)$/);
      if (ulMatch) {
        if (!listBuffer || listBuffer.type !== "ul") {
          flushList();
          listBuffer = { type: "ul", items: [] };
        }
        listBuffer.items.push({ text: ulMatch[1] });
        return;
      }

      flushList();
      elements.push(
        <p key={`p-${lIdx}`} className="my-1.5 leading-relaxed text-foreground/90">
          {renderInlineText(line)}
        </p>,
      );
    });

    flushList();
    blocks.push(<div key={`text-${bIdx}`}>{elements}</div>);
  });

  if (openFence) {
    const openMatch = openFence.match(/^```([\w-]*)\n?([\s\S]*)$/);
    const language = openMatch?.[1]?.trim() ?? "";
    const code = openMatch?.[2] ?? "";

    blocks.push(
      <CodeBlock
        key="code-streaming-open"
        language={language || "code"}
        code={code}
      />,
    );
  }

  return (
    <div
      className={cn(
        "space-y-3 font-sans text-sm text-foreground leading-relaxed",
        className,
      )}
    >
      {blocks}
    </div>
  );
}
