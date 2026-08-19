import "dotenv/config";
import prisma from "../src/lib/db.js";

import { gatherSourceContext } from "../src/services/artifact-generation.services.js";
import { generateArtifactTitleWithGemini } from "../src/lib/gemini.js";


async function backfillArtifactTitles() {
    console.log("Starting artifact title backfill with Gemini AI...");

    const artifacts = await prisma.learningArtifact.findMany({
        orderBy: { createdAt: "desc" },
    });

    console.log(`Found ${artifacts.length} total artifacts.`);

    let updatedCount = 0;

    for (const artifact of artifacts) {
        // Check if title has generic date pattern e.g. "· 19/8/2026" or is generic
        const isGeneric =
            artifact.title.includes(" · ") ||
            artifact.title.includes("·") ||
            artifact.title === artifact.type;

        if (isGeneric) {
            console.log(`\nArtifact ${artifact.id} (${artifact.type}) has generic title: "${artifact.title}"`);

            try {
                const context = await gatherSourceContext(
                    artifact.workspaceId,
                    artifact.sourceIds,
                );

                const newTitle = await generateArtifactTitleWithGemini(
                    artifact.type,
                    context.text,
                );

                if (newTitle && newTitle !== artifact.title) {
                    await prisma.learningArtifact.update({
                        where: { id: artifact.id },
                        data: { title: newTitle },
                    });
                    console.log(`  -> Updated title to: "${newTitle}"`);
                    updatedCount++;
                }
            } catch (err) {
                console.error(`  -> Failed to update artifact ${artifact.id}:`, err);
            }
        }
    }

    console.log(`\nBackfill complete! Updated ${updatedCount} artifact titles.`);
    process.exit(0);
}

backfillArtifactTitles().catch((err) => {
    console.error("Backfill script error:", err);
    process.exit(1);
});
