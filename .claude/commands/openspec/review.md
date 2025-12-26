---
name: OpenSpec: Review
description: Review an archived OpenSpec.
category: OpenSpec
tags: [openspec, review]
---
<!-- OPENSPEC:START -->
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `openspec/AGENTS.md` (located inside the `openspec/` directory—run `ls openspec` or `openspec update` if you don't see it) if you need additional OpenSpec conventions or clarifications.

**Steps**
Track these steps as TODOs and complete them one by one.
1. Read `changes/archive/<id>/proposal.md`, `design.md` (if present), and `tasks.md` to confirm scope and acceptance criteria.
2. Use  `git log` to see what have been done related to theses changes
3. Verify that the implemented development matches the requested functional requirements.
4. Review and critique the produced code against the stated requirements.
5. Check for the presence of bugs; correct them if found some.
6. Check for the presence of security vulnerabilities; correct them if found some.
7. Verify that the existing tests, both backend and frontend, are valid.
8. Verify that the tests are sufficiently exhaustive to prevent future regressions; add more if necessary.
9. Produce a report of the changes. 
 
<!-- OPENSPEC:END -->
