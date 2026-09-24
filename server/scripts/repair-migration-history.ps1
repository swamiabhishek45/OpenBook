# Repairs local DB when P3009 blocks deploy (failed auth + renamed migration history).
# Run from server/:  .\scripts\repair-migration-history.ps1
# Requires Postgres on DATABASE_URL (see .env).

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "1) Mark failed auth migration as applied (tables likely exist from older init)..."
npx prisma migrate resolve --applied "20260810081634_auth"

Write-Host "2) Remove obsolete migration rows not present in prisma/migrations..."
@"
DELETE FROM "_prisma_migrations"
WHERE migration_name LIKE '20260730%';
"@ | npx prisma db execute --stdin

$alreadyInDb = @(
    "20260810061909_test",
    "20260810103207_workspace",
    "20260810110529_sources",
    "20260811065451_conversation_artifacts",
    "20260903120000_add_github_source",
    "20260921103000_normalize_diagram_artifacts",
    "20260922120000_billing_usage_byok"
)

Write-Host "3) Mark migrations as applied when schema was created under older names..."
foreach ($name in $alreadyInDb) {
    Write-Host "   resolve --applied $name"
    npx prisma migrate resolve --applied $name
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   (already recorded or skipped: $name)"
    }
}

Write-Host "4) Deploy remaining migrations (e.g. RAG metrics + embed cache)..."
npx prisma migrate deploy

Write-Host "Done. Verify with: npx prisma migrate status"
