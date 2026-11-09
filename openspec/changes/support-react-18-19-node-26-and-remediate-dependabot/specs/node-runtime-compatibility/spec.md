## ADDED Requirements

### Requirement: Node.js 26 build support
The project SHALL support dependency installation and library build on Node.js 26 using the documented package manager and committed lockfile.

#### Scenario: Clean install on Node.js 26
- **WHEN** dependencies are installed from a clean checkout under Node.js 26
- **THEN** installation completes reproducibly without requiring dependency resolutions or overrides

#### Scenario: Build on Node.js 26
- **WHEN** the documented build command runs under Node.js 26 after installation
- **THEN** the TypeScript library build completes successfully and emits the package's distributable outputs
