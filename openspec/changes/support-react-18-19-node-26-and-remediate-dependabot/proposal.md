## Why

The library declares React 16.14 as its only supported peer and depends on an aging package tree with known Dependabot alerts. Consumers need supported React 18 and 19 compatibility and a secure dependency graph, while preserving the library's existing CRUD component behavior.

## What Changes

- Support React and React DOM 18 and 19 as consumer peer versions.
- Resolve all active Dependabot alerts by upgrading or replacing affected packages; do not use package-manager resolutions/overrides to mask vulnerable transitive versions.
- Make the build and dependency-management workflow runnable on Node.js 26.
- Add validation for supported React versions and existing public component behavior so regressions can be detected.
- Update installation and compatibility documentation to describe the supported React versions and Node.js 26 development/build baseline.

## Capabilities

### New Capabilities
- `react-version-compatibility`: Defines supported React/React DOM versions and observable compatibility expectations for library consumers.
- `dependency-security`: Defines the requirement that active Dependabot alerts are remediated through supported direct dependency upgrades or replacements without resolutions/overrides.
- `node-runtime-compatibility`: Defines Node.js 26 support for installing dependencies and building the library.

### Modified Capabilities

None. No existing OpenSpec capability specs are present in this repository.

## Impact

Affected areas include `package.json`, `yarn.lock`, TypeScript React type dependencies, build tooling/configuration, React component integration points, and README compatibility guidance. The current code uses legacy React lifecycle methods and `findDOMNode`; the dependency set includes old React Bootstrap, React Redux, date/time, typeahead, and select packages. The existing test script has no test suite, so behavior-preservation validation must be established as part of this change. The active alert list must be inventoried at implementation time because it could not be retrieved during exploration.
