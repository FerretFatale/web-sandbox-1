# FAQ and Edge Cases

## FAQ

1. Can The_Vault act without approval?
- For live external mutations or risky operations, explicit approval is required.

2. How do I force better routing?
- Name target domain and expected owner in your request.

3. What if a lane is blocked?
- Capture exact blocker and required human action, then pause as partial.

4. Why does it ask for deterministic tests?
- To prevent false completion and regression risk.

5. How do I recover from interrupted work?
- Reconstruct from artifacts/commits/logs, then resume with a narrowed lane.

## Edge cases

1. Authority ambiguity (`KAOS` naming vs production authority): default to The_Vault authority.
2. Multiple dirty files from unrelated work: scope your commit; do not sweep all changes.
3. Publish target mismatch: verify `manual_publish_targets.json` before publish.
4. External feature gap discovered mid-lane: run assimilation flow (Adopt/Scaffold/Defer).
