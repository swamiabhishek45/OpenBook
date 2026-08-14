"use client";

import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delayMs);

        return () => window.clearTimeout(timer);
    }, [value, delayMs]);

    return debouncedValue;
}
