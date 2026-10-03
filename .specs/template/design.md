# Design — <name of the work>

> How it will be done, and **why that way**. The "why" is what survives; the "how" changes.

## Approach

In a few paragraphs: the shape of the solution and the path the data takes.

## Files affected

| File | Role |
| ---- | ---- |

Reuse: point at what already exists in the repository and will be reused, with its path. New code that
duplicates something existing is a design defect, not a detail.

## Technical decisions

One entry per decision someone could question later.

### <decision>

**Choice:** ...
**Why:** ...
**Rejected alternative:** ... and the reason.

## Known risks

Ordered by severity. For each: how it shows up and what mitigates it. A risk whose mitigation is "be
careful" is not mitigated.

| Risk | How it shows up | Mitigation |
| ---- | --------------- | ---------- |

## Failing safely

What the code does when it cannot be certain. For a destructive or irreversible operation the default is to
**refuse**, not to proceed. Record here where that choice was made and where it was not.
