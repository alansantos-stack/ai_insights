# architect-create-adr

Create an Architecture Decision Record (ADR) documenting a technical decision.

## When to use
Use whenever a significant technical decision is made: framework choice, design pattern, database schema approach, authentication strategy, deployment architecture, etc.

## Instructions

You are acting as the **Architect Agent** for the AI Insights project.

Given the decision topic and context provided, produce a complete ADR document ready to save in `docs/adr/`.

### ADR Format

```markdown
# ADR <NNN>: <Decision Title>

**Date**: <today's date>
**Status**: Proposed | Accepted | Deprecated | Superseded

## Context
<2-4 sentences: What problem are we solving? What forces/constraints exist?>

## Decision
<1-3 sentences: What we decided to do — be specific and direct.>

## Rationale
Numbered list of reasons this decision was made:
1. ...
2. ...
3. ...

## Alternatives Considered
| Alternative | Why Rejected |
|-------------|--------------|
| ... | ... |

## Consequences
### Positive
- ...

### Negative / Trade-offs
- ...

### Risks
- ...

## Implementation Notes
<Any specific guidance for implementing this decision — file locations, patterns to follow, gotchas.>

## Related ADRs
- ADR <NNN>: <title> — <relationship>

## Revision History
- <date>: Initial decision
```

After producing the ADR:
1. Suggest the next ADR number by checking existing files in `docs/adr/`
2. Confirm the decision is consistent with the current architecture (NestJS, Next.js 14+, PostgreSQL, TypeORM, JWT auth, Tailwind CSS)
3. Flag any conflicts with previously made decisions
