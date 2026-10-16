/** Public HTTPS URL of this API (no trailing slash). */
export function getPublicServerUrl(): string {
    const raw =
        process.env.INNGEST_SERVE_ORIGIN?.trim() ||
        process.env.SERVER_URL?.trim() ||
        process.env.BETTER_AUTH_URL?.trim() ||
        "";
    return raw.replace(/\/$/, "");
}

export function isProductionRuntime() {
    return process.env.NODE_ENV === "production";
}

/** Local `npm run inngest` dev server — never on Render/production. */
export function isInngestDevMode() {
    if (isProductionRuntime()) {
        return false;
    }
    const flag = process.env.INNGEST_DEV?.trim().toLowerCase();
    return flag === "1" || flag === "true";
}

export function hasInngestEventKey() {
    return Boolean(process.env.INNGEST_EVENT_KEY?.trim());
}

export function hasInngestSigningKey() {
    return Boolean(process.env.INNGEST_SIGNING_KEY?.trim());
}

/** All values required for Inngest Cloud to invoke this app successfully. */
export function hasCompleteInngestCloudConfig() {
    return (
        hasInngestEventKey() &&
        hasInngestSigningKey() &&
        Boolean(getPublicServerUrl())
    );
}

/**
 * Opt-in Inngest Cloud on production. Without this, jobs run in-process on the
 * web service (recommended for Render unless you configure sync URL correctly).
 */
export function shouldUseInngestCloud() {
    const flag = process.env.INNGEST_USE_CLOUD?.trim().toLowerCase();
    const optedIn = flag === "1" || flag === "true";
    if (!optedIn) {
        return false;
    }
    return hasCompleteInngestCloudConfig();
}

export function shouldUseInngestDevServer() {
    return !isProductionRuntime() && isInngestDevMode();
}

export function isInngestConnectionError(error: unknown) {
    if (!(error instanceof Error)) {
        return false;
    }
    const cause = error.cause as { code?: string } | undefined;
    if (cause?.code === "ECONNREFUSED") {
        return true;
    }
    return error.message.toLowerCase().includes("fetch failed");
}

export function configureInngestServeEnv() {
    const publicUrl = getPublicServerUrl();
    if (publicUrl && !process.env.INNGEST_SERVE_ORIGIN?.trim()) {
        process.env.INNGEST_SERVE_ORIGIN = publicUrl;
    }
}

export function logInngestStartupMode() {
    if (shouldUseInngestCloud()) {
        console.log(
            `[Inngest] Cloud mode — sync URL: ${getPublicServerUrl()}/api/inngest`,
        );
        return;
    }
    if (shouldUseInngestDevServer()) {
        console.log("[Inngest] Local dev server mode (INNGEST_DEV=1)");
        return;
    }
    console.log(
        "[Inngest] In-process background jobs (set INNGEST_USE_CLOUD=1 + keys to use Inngest Cloud)",
    );
}
