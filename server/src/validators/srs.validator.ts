import { z } from "zod";

export const reviewFlashcardSchema = z.object({
    cardIndex: z.number().int().min(0, "Card index must be non-negative"),
    rating: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
    ]),
});

export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;
