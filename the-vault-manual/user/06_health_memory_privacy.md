# Health, Memory, and Privacy

This chapter covers three critical systems that affect long-term quality:

1. health tracking,
2. memory handling,
3. privacy and safety boundaries.

## Health capability map

The Vault includes practical health operations such as:

1. symptom logging,
2. mood and routine tracking,
3. exercise and food logging,
4. appointment context capture,
5. trend-oriented summaries.

Use these features to build continuity, not medical diagnosis.

## Memory layers (what each one is for)

### User memory

- Durable preferences and long-term patterns.
- Use for stable personal/operator context.

### Session memory

- Current conversation context only.
- Use for in-progress plan state.

### Repository memory

- Codebase/project facts and conventions.
- Use for repeatable project behavior.

## Memory best practices

1. Keep entries short and factual.
2. Store decisions where future runs can find them.
3. Avoid dumping entire transcripts into memory notes.
4. Retire outdated memory entries when superseded.

## Privacy boundaries (must-follow)

1. Do not commit secrets to git.
2. Keep credentials in local runtime environment only.
3. Redact private data before external sharing.
4. Treat logs as potentially sensitive.

## Safe handling checklist

Before sharing output externally:

1. scan for tokens, passwords, account IDs,
2. remove personal or medical details unless explicitly required,
3. confirm approval status for external writes,
4. keep a local-only copy when required for audit.

## Retention hygiene

1. Keep only needed operational context.
2. Archive stale artifacts to reduce noise.
3. Prefer searchable, structured notes over long freeform dumps.

## Trust model

The_Vault should explain what it can and cannot do, and surface blockers instead of guessing.
