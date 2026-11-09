## ADDED Requirements

### Requirement: Active Dependabot alerts are remediated without resolutions
The project SHALL resolve every active Dependabot alert in the repository dependency graph using supported package upgrades or replacements, and SHALL NOT use package-manager resolutions or overrides to pin transitive versions.

#### Scenario: Alert inventory is reconciled
- **WHEN** the dependency remediation is completed
- **THEN** every active alert in the repository's manifest and lockfile has a documented package-level fix and is no longer active

#### Scenario: No resolution workaround is introduced
- **WHEN** the final manifests and lockfile are inspected
- **THEN** there are no `resolutions` or `overrides` fields added to suppress or force transitive dependency versions

#### Scenario: Dependency tree is reproducible
- **WHEN** dependencies are installed from the committed lockfile
- **THEN** the resolved dependency tree includes the selected fixes without unresolved peer dependency conflicts
