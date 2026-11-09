## ADDED Requirements

### Requirement: React 18 and 19 consumer compatibility
The library SHALL support React and React DOM 18 and 19 as peer dependencies and SHALL preserve its documented component behavior on both major versions.

#### Scenario: React 18 consumer installs the library
- **WHEN** an application uses a compatible React 18 and React DOM 18 pair
- **THEN** the package manager accepts the library peer dependencies and the library components can be used

#### Scenario: React 19 consumer installs the library
- **WHEN** an application uses a compatible React 19 and React DOM 19 pair
- **THEN** the package manager accepts the library peer dependencies and the library components can be used

#### Scenario: Existing component behavior is exercised on both versions
- **WHEN** the compatibility suite runs against React 18 and React 19
- **THEN** the documented CRUD component interactions and exported APIs satisfy the same expected outcomes
