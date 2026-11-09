# React and dependency compatibility

- Added React and React DOM 18 and 19 peer support, validated with the library build and CRUD component behavior checks.
- Upgraded the React UI integrations and migrated their wrappers while retaining the library's exported CRUD APIs.
- Replaced obsolete JSON, timezone, time-picker, and file-drop integrations; updated Bootstrap styling guidance to Bootstrap 5.
- Removed the `query-string` runtime dependency and kept model URL query serialization in the library.
- Updated vulnerable dependencies and regenerated `yarn.lock`. The local Yarn audit reports no advisories.
- Node.js 26 is the development and release build baseline.

Consumers should install matching React and React DOM 18 or 19 versions and use Bootstrap 5 styles. The new dependency majors may change the appearance and keyboard behavior of date/time, dropdown, timezone, and file-upload controls; validate those interactions in the consuming application before release.
