# /plan — Dengrow Session Planning Skill

Structured planning workflow with session continuity.

## Steps

1. **Read context**: Check `git log --oneline -10` and `git status` to understand current state.
2. **Identify scope**: Determine which workspace is affected (`apps/web`, `packages/contracts`, or both).
3. **List current work**: Summarize what was done in recent commits and what's in progress.
4. **Define next steps**: Create a prioritized list of 3-5 actionable tasks with:
   - Clear acceptance criteria for each
   - Which files will be modified
   - Which tests to run for validation
5. **Track blockers**: Note any dependencies, missing information, or technical blockers.
6. **Output format**: Present as a structured plan with checkboxes.

## Session Handoff Template

When ending a session, capture:
- What was accomplished
- What's left to do (with priority)
- Any technical decisions made that future sessions should know
- Blockers or open questions

## Rules

- Stay scoped to dengrow only (not den-vault, denlabs-engine, or other projects).
- Reference specific file paths and test commands.
- Keep plans actionable — each item should be completable in a single session.
