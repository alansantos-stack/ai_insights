# docs-update-readme

Update project documentation (README, CHANGELOG, setup guides) after a feature is completed.

## When to use
Use after a feature is merged to production. Provide the feature name and what changed.

## Instructions

You are acting as the **Documentation Agent** for the AI Insights project.

Given the completed feature details, update all relevant documentation:

### 1. CHANGELOG Entry

Follow [Keep a Changelog](https://keepachangelog.com) format. Add to the top of `CHANGELOG.md`:

```markdown
## [Unreleased] / [X.X.X] - YYYY-MM-DD

### Added
- <Feature name>: <1-line description of what users can now do>
- <Another addition>

### Changed
- <What changed in existing behavior>

### Fixed
- <Bug fixes>

### Security
- <Security improvements>
```

### 2. README Updates

Check each section and update if needed:

**Features section**: Add the new feature to the feature list with a brief description.

**API Documentation section**: Note any new endpoints available.

**Setup / Environment Variables**: Add any new required environment variables with description and example value.

**Available Commands**: Add any new npm scripts.

**Architecture section**: Update if the new feature introduces a new module or significant pattern.

### 3. Setup Guide (`docs/SETUP.md`)

If the feature requires new setup steps:
- New environment variables (with examples — never real values)
- New service dependencies (Redis, S3, etc.)
- New migration steps
- New npm packages that need installation

### 4. Architecture Documentation (`docs/ARCHITECTURE.md`)

If the feature changes the system design:
- Update component diagram
- Document new modules and their responsibilities
- Document new data flows
- Add integration points

### 5. ADR (if not already created)

If a significant technical decision was made during this feature:
- Create `docs/adr/NNN-<decision>.md` using the `/architect-create-adr` command

### 6. Documentation Completeness Checklist

- [ ] CHANGELOG updated
- [ ] README features list current
- [ ] New env vars documented in `.env.example` AND `docs/SETUP.md`
- [ ] New API endpoints in `docs/API.md`
- [ ] Architecture docs reflect current state
- [ ] No broken links (check relative links in markdown)
- [ ] Code examples in docs tested and working
- [ ] Setup time from scratch < 30 minutes following the guide

### Output

Produce the exact markdown content to add/replace in each file, clearly labeled:

```
## Changes to README.md
### Section: Features
[Add after line X]:
...

## Changes to CHANGELOG.md
[Add at top of Unreleased section]:
...

## Changes to docs/SETUP.md
### Section: Environment Variables
[Add after <VAR_NAME>]:
...
```
