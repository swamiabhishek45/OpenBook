import { flattenError, type ZodError } from "zod";

export function getZodFieldErrors(error: ZodError) {
    return flattenError(error).fieldErrors;
}