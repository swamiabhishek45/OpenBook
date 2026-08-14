"use client";

import { useMemo } from "react";
import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";

export type StreamdownContentProps = {
    content: string;
    mode?: "static" | "streaming";
    isAnimating?: boolean;
    className?: string;
};

export function StreamdownContent({
    content,
    mode = "static",
    isAnimating = false,
    className,
}: StreamdownContentProps) {
    const plugins = useMemo(() => ({ code }), []);

    return (
        <Streamdown
            mode={mode}
            isAnimating={isAnimating}
            plugins={plugins}
            className={className}
        >
            {content}
        </Streamdown>
    );
}
