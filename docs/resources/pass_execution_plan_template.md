# Pass X — [Pass Title] Implementation Plan

## 1. Scope boundary

### In scope

- [item]
- [item]
- [item]

### Out of scope

- [item]
- [item]
- [item]

## 2. Preconditions

Required prior state:

- [accepted previous pass state]
- [required installed modules/apps]
- [required data/configuration]
- [required test record]

## 3. Ownership and module boundary

Primary module:

```text
[module_name]
```

Secondary module touchpoints, if any:

```text
[module_name] — [specific reason]
```

No other module should be patched unless the pass plan is explicitly amended.

## 4. Files likely touched

Expected files:

```text
modules/[module]/models/...
modules/[module]/views/...
modules/[module]/data/...
modules/[module]/report/...
docs/...
```

Generated files that must not be committed:

```text
dist/*.zip
generated PDFs
screenshots
temporary exports
```

## 5. Slice plan

### X-A — [slice title]

Goal:

- [goal]

Expected changes:

- [change]

Sanity checks:

- [check]

Odoo acceptance:

- [acceptance]

### X-B — [slice title]

Goal:

- [goal]

Expected changes:

- [change]

Sanity checks:

- [check]

Odoo acceptance:

- [acceptance]

### X-C — [slice title]

Goal:

- [goal]

Expected changes:

- [change]

Sanity checks:

- [check]

Odoo acceptance:

- [acceptance]

## 6. Slice implementation log

Append to this section as slices are implemented.

### X-A implementation log

#### X-A1 — [subslice name]

Patch/script applied:

```text
[pypatch/script reference]
```

Sanity result:

```text
[paste result]
```

Odoo result:

```text
[paste result]
```

Lessons learned:

- [lesson]

Status:

```text
pending / passed / failed / superseded
```

### X-B implementation log

#### X-B1 — [subslice name]

Patch/script applied:

```text
[pypatch/script reference]
```

Sanity result:

```text
[paste result]
```

Odoo result:

```text
[paste result]
```

Lessons learned:

- [lesson]

Status:

```text
pending / passed / failed / superseded
```

## 7. Tracebacks and fixes

Append every traceback/fix pair.

### Traceback 1

Error:

```text
[paste traceback]
```

Root cause:

```text
[diagnosis]
```

Fix applied:

```text
[patch/subslice]
```

Acceptance after fix:

```text
[result]
```

## 8. Final acceptance gates

The pass cannot close until all gates pass:

- [ ] XML parses cleanly.
- [ ] server-action Python compiles where relevant.
- [ ] module zip builds locally.
- [ ] Odoo install/upgrade succeeds.
- [ ] relevant UI surfaces render correctly.
- [ ] happy path acceptance passes.
- [ ] blocked/error path acceptance passes.
- [ ] chatter/activity/artifact behavior is verified where relevant.
- [ ] generated files are not committed.
- [ ] commit message recorded.

## 9. Commit log

Commit command used:

```bash
git commit -m "passX: [summary]" \
  -m "[details]"
```

Commit hash:

```text
[paste hash]
```

## 10. Closure notes

Locked:

- [item]

Deferred:

- [item]

Carried forward:

- [item]
