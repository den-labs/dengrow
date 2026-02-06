# /commit — Dengrow Commit Skill

Structured commit workflow for the dengrow monorepo.

## Steps

1. Run `git status` and `git diff --staged` to see current changes.
2. If nothing is staged, show the user the unstaged changes and ask what to stage.
3. Analyze all staged changes and group them by feature/concern (NOT by file type).
4. Generate a conventional commit message:
   - Format: `type(scope): description`
   - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`
   - Scopes: `web`, `contracts`, or feature name (e.g., `impact`, `plant-game`)
   - Keep the summary line under 72 characters
   - Add a body with bullet points if the change is multi-faceted
5. Show the proposed commit message to the user for approval.
6. Create the commit with the signature line:

   Wolfcito @akawolfcito

7. Run `git status` to confirm success.

## Rules

- Never commit `.env`, `.env.local`, or files containing secrets.
- Never use `git add -A` or `git add .` — stage specific files.
- If changes span multiple concerns, suggest splitting into multiple commits.
- Always include the signature line at the end.
