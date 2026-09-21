-- Legacy mind maps were persisted as DIAGRAM in some databases.
-- Normalize to MINDMAP so the app uses a single type going forward.
UPDATE "learning_artifact"
SET "type" = 'MINDMAP'
WHERE "type"::text = 'DIAGRAM';
