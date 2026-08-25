import { flattenError, type ZodError } from "zod";

/**
 * Extracts and flattens field-level error messages from a ZodError validation failure.
 *
 * @param error - Zod validation error instance
 * @returns Map of field names to error message arrays
 */
export function getZodFieldErrors(error: ZodError) {
    return flattenError(error).fieldErrors;
}