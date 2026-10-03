# `.specs/` — spec-driven development

A piece of work starts as a specification, not as code. This folder holds what is **in flight**; `docs/`
holds what is **durable**.

## The boundary (important)

The repository already had four documentation homes before this folder existed. None was moved.

| Location                              | Lifetime            | Contents                                                            |
| ------------------------------------- | ------------------- | ------------------------------------------------------------------- |
| `.specs/BACKLOG.md`                   | permanent           | work identified and recorded, not yet specified                     |
| `.specs/memory/`                      | permanent, volatile | **verified** technical facts about the system, and library pitfalls |
| `.specs/shared/`                      | permanent           | contracts: schemas, formats, canonical lists                        |
| `.specs/changes/<yyyy-MM-dd>_<slug>/` | ephemeral           | the work in flight                                                  |
| `.specs/archive/<yyyy-MM-dd>_<slug>/` | historical          | finished work                                                       |
| `.specs/template/`                    | permanent           | templates for new work                                              |
| `docs/runbooks/`                      | permanent           | operational procedures                                              |

**Language: English.** Everything in this repository is written in English, including specs, code
comments and script output.

## Lifecycle of a piece of work

1. `cp -r .specs/template .specs/changes/<yyyy-MM-dd>_<slug>` and fill in `spec.md` — **before** writing code.
2. `design.md` once the technical approach is decided. Record the _why_, not just the _what_.
3. `tasks.md` as the single source of state. Every item states what verifies it.
4. `findings.md` for what was **measured** during execution: real numbers, observed behaviour, bugs found.
   This is what stops the next person rediscovering the same thing.
5. On closing:
   - a procedure someone will repeat → `docs/runbooks/`
   - a verified technical fact → `.specs/memory/`
   - the whole folder → `.specs/archive/<yyyy-MM-dd>_<slug>/`

`.specs/changes/` is always the **only** place holding in-flight state. If a piece of information lives in
two places, one of them is wrong.

## The rule for `memory/`

Only what has been **verified** goes in, with the evidence that proved it. A fact without evidence is an
assumption, and an assumption in a memory file is worse than an absence — it becomes true by repetition.
Every claim records how it was proven: an introspection query, an observed error, a measurement.
