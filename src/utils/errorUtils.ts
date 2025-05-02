export function isErrorWithStatus(error: unknown): error is { status: number } {
    return (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as Record<string, unknown>).status === "number"
    );
}