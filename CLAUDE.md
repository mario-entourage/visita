# CLAUDE.md

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__Claude_in_Chrome__*` tools.

### Available skills

- `/plan-ceo-review` — CEO-level plan review
- `/plan-eng-review` — Engineering plan review
- `/plan-lazy-dev` — Lazy dev plan review: minimize code, interrogate intent, push complexity to requirements
- `/ux-analyst` — UX analyst review: broken interactions, device compatibility, color coherence, ASCII screen renders
- `/review` — Code review
- `/ship` — Ship code
- `/browse` — Web browsing
- `/qa` — QA testing
- `/qa-only` — QA testing only
- `/setup-browser-cookies` — Set up browser cookies
- `/retro` — Retrospective
- `/document-release` — Document a release

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
