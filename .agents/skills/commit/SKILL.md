---
name: commit
description: "Use when creating or preparing a Git commit in KynWallet; checks changes, runs verification, and writes a Conventional Commit message."
---

# Git Commit Skill

Create well-formatted git commits following Conventional Commits for the kynwalletPower project.

## Usage
In Codex CLI, use `/skills` to list available skills or type `$commit` to invoke this skill.

## Behavior
1. Check all repository changes:
    ```bash
    git status --short
    git diff
    git diff --staged 
    ```
2. Identify whether unstaged changes belong to the same logical commit.
3. If there are no staged or unstaged changes, stop and explain that there is nothing to commit.
4. If unstaged changes clearly belong to the requested commit, stage them selectively:
    ```bash
    git add <related-files>
    ```
5. Never run git add . unless every changed file has been reviewed and clearly belongs to the same commit.
6. Do not stage secrets, local configuration, IDE files, build outputs, generated junk, or unrelated changes.
7. If changes span multiple unrelated areas, stop and suggest splitting them into separate commits.
8. Run project verification before committing:
   ```bash
   npm run verify
   ```
9. If verification fails, stop and summarize the failure.
10. Generate a Conventional Commit message based only on staged changes.
11. Create the commit with proper formatting.

## Commit Format
```
<type>(<scope>): <description>

[optional body]
```

## Types
- feat: New feature or domain capability
- fix: Bug fix
- docs: Documentation, specs, ADRs, or README changes
- style: Formatting-only changes
- refactor: Internal code change without behavior change
- test: Adding or modifying tests
- chore: Maintenance, tooling, dependencies, configs

## Suggested Scopes
- rooms
- stays
- guests
- payments
- ledger
- auth
- api
- db
- infra
- specs
- tests
- ci

## Rules
- Use English for commit messages.
- Keep the subject under 72 characters.
- Use imperative mood: add, fix, update, remove.
- Do not mention files one by one unless it helps explain the change.
- Do not commit unrelated changes together.
- Do not create a commit if staged changes include secrets, generated junk, or accidental files.
- Prefer selective staging with git add <file> instead of broad staging.
- If the user asks for a specific scope, only include files related to that scope.
- If unsure whether a file belongs in the commit, ask before staging it.

## Examples
```
feat(stays): support multiple guests per stay

- Add stay guests relation
- Validate room capacity before confirming a stay
- Keep primary guest as the booking contact
```
```
fix(rooms): prevent booking occupied rooms

- Reject stay creation when the room has an active stay
- Add regression test for concurrent booking attempts
```
```
docs(specs): record payment ledger decisions

- Add ADR for partial payments
- Clarify guest account balance rules
```
