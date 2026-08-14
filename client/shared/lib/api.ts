export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public details?: unknown,
    ) {
        super(message);
        this.name = "ApiError";
    }
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const isFormData = options.body instanceof FormData;

    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
            ...(!isFormData ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            (data as { error?: string; message?: string } | null)?.error ||
            (data as { error?: string; message?: string } | null)?.message ||
            `Request failed with status ${response.status}`;

        throw new ApiError(
            response.status,
            message,
            (data as { details?: unknown } | null)?.details,
        );
    }

    return data as T;
}
