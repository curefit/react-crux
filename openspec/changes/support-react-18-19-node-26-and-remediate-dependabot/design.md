## Context

The package is a TypeScript React component library built with `tsc`, distributed from `dist`, with Yarn Classic and an old lockfile. Its peer dependencies are pinned to React/React DOM 16.14. The source imports a set of legacy UI integrations (including React Bootstrap 0.32, React Redux 5, React Datepicker 1, React Dropzone 5, React JSON View 1, and React Select 3), uses deprecated class lifecycle methods in several components, and calls `ReactDOM.findDOMNode`. The repository currently has no real test suite. Node 26 is the requested development/build runtime. The live Dependabot alert inventory must be retrieved during implementation because it was inaccessible during exploration.

The change must preserve the library's public exports, CRUD workflows, styles, and consumer-facing component behavior while expanding supported React versions and clearing active dependency alerts. It must not rely on Yarn `resolutions`, npm `overrides`, or equivalent forced transitive pins.

## Goals / Non-Goals

**Goals:**

- Support matching React and React DOM 18 and 19 consumer installations.
- Resolve all active Dependabot alerts through direct dependency upgrades or replacements.
- Make clean dependency installation and the package build work on Node.js 26.
- Establish automated compatibility checks that exercise the existing public component behaviors against React 18 and 19.
- Document the supported runtime and consumer peer versions.

**Non-Goals:**

- Redesigning the library's CRUD API or changing component semantics.
- Changing styling or visual design except where a dependency migration requires a compatibility adjustment.
- Supporting React versions outside 18 and 19 as part of this change.
- Upgrading unrelated development infrastructure without a Node 26, React compatibility, or alert-remediation reason.

## Decisions

1. **Declare React 18 and 19 as peers and test them as separate consumer environments.** Use a peer range that accepts both majors while keeping `react` and `react-dom` aligned. Validate with isolated installs or a matrix, so one React copy/version does not conceal peer issues. Alternative: retain a React 16 peer and rely on consumers to bypass warnings; rejected because it does not formally support the requested versions.

2. **Resolve alerts with supported package upgrades or replacements, without resolutions/overrides.** Begin by exporting the active alert inventory and mapping each alert to its dependency path and affected feature. Prefer compatible releases that fix the alert; if an abandoned integration blocks React support or has no secure release, replace it and adapt the importing components. Alternative: force a transitive version with a resolution; rejected by the explicit requirement and because it can leave incompatible APIs in the tree.

3. **Treat compatibility as a behavior-preserving dependency migration.** Keep existing component interfaces and workflows stable. For each changed integration, characterize current behavior and cover it with tests before or alongside the upgrade. Include React Strict Mode checks where practical, especially around deprecated lifecycle behavior and DOM access. Alternative: broad component redesign; rejected as unnecessarily large and harder to verify.

4. **Use Node.js 26 for the clean-install and build baseline.** Update runtime metadata/documentation and only modernize build tooling that prevents the documented install or `tsc` build under Node 26. The webpack example config is legacy and outside the package's primary `build` script; only bring it forward if it is part of the supported project workflow or blocks validation. Alternative: modernize all tooling preemptively; rejected to keep scope tied to required outcomes.

5. **Add a real, focused test/compatibility setup because none exists today.** Test public exports and the component families affected by dependency upgrades, and run the suite with React 18 and 19. Use consumer-visible assertions rather than implementation-only snapshots. Alternative: rely only on a TypeScript build; rejected because compilation alone cannot establish unchanged application behavior.

## Risks / Trade-offs

- [Some legacy UI integrations may have no maintained React 18/19-compatible release] → Inventory package peers and maintenance status early; replace only the integrations that block the target versions or alert fixes, keeping adapters localized to the affected components.
- [Major upgrades can alter keyboard, focus, date parsing, upload, or styling behavior] → Capture current behavior and verify representative CRUD flows and styles after each dependency family migration.
- [React 19 type definitions may surface stricter TypeScript errors] → Upgrade React type packages coherently and keep runtime peer validation separate from declaration compilation.
- [Adding tests introduces setup and maintenance work] → Keep the initial suite focused on documented behavior and regression-prone integration points.
- [Alert state can change while implementation is underway] → Record alert identifiers and fixed package versions at the time of remediation, then recheck the repository alert page before completion.
- [Yarn Classic or old webpack tooling may fail under Node 26] → Prove the clean install and documented package build early; modernize or migrate package tooling only if required for that supported path.

## Migration Plan

1. Retrieve and record all open Dependabot alerts, inspect package usage and peer ranges, and identify packages requiring upgrade versus replacement.
2. Establish a baseline build and behavior checks; add focused tests for exported component workflows before changing integrations.
3. Upgrade or replace dependencies in logical UI families, updating TypeScript types and source adapters while preserving public APIs.
4. Update React/React DOM peer metadata and run isolated compatibility validation under React 18 and React 19.
5. Run clean installation, build, test, and lockfile security checks using Node.js 26; confirm no resolutions/overrides were introduced and no active alerts remain.
6. Update README/runtime guidance and publish the package with a release note describing the supported React versions and any unavoidable consumer-visible migration detail.

Rollback: revert the dependency manifest/lockfile and compatibility edits as one change. Do not publish the new version until both React matrix environments, Node 26 install/build, and the alert recheck pass.

## Open Questions

- What exact active Dependabot alerts are currently open, and do repository credentials permit checking their latest status during implementation?
- Should the package continue to use Yarn Classic, or is changing package manager acceptable if Node 26 reproducibility requires it?
- Which documented examples or consumer workflows are considered the required behavior baseline for component-level regression tests?
- Are any currently declared but unused dependencies expected to remain part of the published package surface?
