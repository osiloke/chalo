## [1.0.3](https://github.com/osiloke/chalo/compare/v1.0.2...v1.0.3) (2026-04-05)


### Performance Improvements

* fix janky bubbles animation in SmartDrawer ([5ebfc79](https://github.com/osiloke/chalo/commit/5ebfc79fcdb29b46d36ba373dcc4e93288ef68c2))

## [1.0.2](https://github.com/osiloke/chalo/compare/v1.0.1...v1.0.2) (2026-04-05)


### Bug Fixes

* **packages/chalo:** reinstate LICENSE in prepack for npm README visibility ([6338d45](https://github.com/osiloke/chalo/commit/6338d45a0d0137fe0895d32f821f90321a1ca58e))

## [1.0.1](https://github.com/osiloke/chalo/compare/v1.0.0...v1.0.1) (2026-04-05)


### Bug Fixes

* **release:** use npm publish instead of pnpm publish for OIDC support ([f61fef8](https://github.com/osiloke/chalo/commit/f61fef85e0fc924ccf1c49577736d8ff0b0e0008))

# 1.0.0 (2026-04-05)


### Bug Fixes

* add [@source](https://github.com/source) directive to index.css for chalo package ([eb0717c](https://github.com/osiloke/chalo/commit/eb0717c5ac0d251ffddf359b5f71b129a51d0f65))
* add eslint config and fix all lint errors ([864e906](https://github.com/osiloke/chalo/commit/864e906e569b1ef2db7d69720b88dc7c632b3603))
* add missing dependencies and bump to 0.1.2 ([2bd4584](https://github.com/osiloke/chalo/commit/2bd4584e60ed9e1a0b715ce4484c864c000036a3))
* **ci:** add --passWithNoTests to vitest in CI and release workflows ([258b742](https://github.com/osiloke/chalo/commit/258b742cfa31c511eb3355526d95402620ee7cc3))
* **ci:** specify pnpm version in workflows and package.json ([552f0c2](https://github.com/osiloke/chalo/commit/552f0c24d9c831a2451e4afbaa5096433d19d9e9))
* **ci:** use pnpm instead of npm ci in CI workflow ([0b39c3f](https://github.com/osiloke/chalo/commit/0b39c3f2291a5ccf35d4f8ec7c7d194fc862d31d))
* clear stale DOM signals on step change to prevent premature waitFor triggers ([da58174](https://github.com/osiloke/chalo/commit/da58174e73cad4435a1f9315b4e7af4d4fa0a3cf))
* close button clears active mission so it can be restarted ([c489d53](https://github.com/osiloke/chalo/commit/c489d532c006ecea853c1534bca1a5a183e9f1fd))
* connect modal form to Chalo store, remove redundant useChaloFieldSync ([a47c4f2](https://github.com/osiloke/chalo/commit/a47c4f28e24a3108bdb28d62a8de7a565b9ecebb))
* dismiss all incomplete tours when closing drawer ([6845831](https://github.com/osiloke/chalo/commit/6845831d53f37cabe1434bf9de64671fc7c8693b))
* dismiss tour entry when closing drawer to prevent resume prompt loop ([ca3693c](https://github.com/osiloke/chalo/commit/ca3693cfdb7529e4312d20d418b2bcbec5dd643b))
* encapsulate bidirectional form-store sync in useChalo hook ([3b75582](https://github.com/osiloke/chalo/commit/3b75582b1e655721cd89cb0ba797147856fc56d0))
* fix modal form text synchronization and waitFor conditions ([1261ab5](https://github.com/osiloke/chalo/commit/1261ab52497185f80d963a499d595beb68fe1116))
* make startMission atomic to prevent resume prompt flash ([751609b](https://github.com/osiloke/chalo/commit/751609b8209840fef0924626fe1d4b7e404b4603))
* modal form sync blocked by default value pollution in form.watch ([f257d7a](https://github.com/osiloke/chalo/commit/f257d7ab11797bd5257c3bc3525df66383439c7b))
* prevent auto-skip in waitFor step polling ([a3ac8ab](https://github.com/osiloke/chalo/commit/a3ac8aba3885a2b33cc4ce363f163d66267d18b9))
* refine bidirectional sync and interaction history in chalo engine ([cf1ca55](https://github.com/osiloke/chalo/commit/cf1ca551a58dc4c23ea600ed51a50c01018c71d7))
* **release:** bump node version to 22 for semantic-release compatibility ([6a850a9](https://github.com/osiloke/chalo/commit/6a850a96fc598bac858341da4c2bb6c4f6b67f53))
* **release:** remove broken npm update step ([32dc498](https://github.com/osiloke/chalo/commit/32dc498120f418673e7f071c46686370f0ac68aa))
* **release:** update npm to latest for OIDC trusted publishing support ([7e69c61](https://github.com/osiloke/chalo/commit/7e69c61522e8dfcee7b1f98e3c7c28a17411b036))
* **release:** use sed for version bump and pnpm publish to support workspace protocol ([467ea91](https://github.com/osiloke/chalo/commit/467ea9171fb316e791d0958b2accf0b77175acb0))
* remove auto-start on hover from dashboard card ([a9610f9](https://github.com/osiloke/chalo/commit/a9610f9a7381a49e20e2ead95fdf57f4bc64317f))
* remove tsconfig.node.json reference from root tsconfig ([dfb9c62](https://github.com/osiloke/chalo/commit/dfb9c62e7039ea24bf3e4488602ba49d0ee12a18))
* rename package to @osiloke/chalo due to npm name conflict ([9b8f4a6](https://github.com/osiloke/chalo/commit/9b8f4a65974e3a6918405e21ee655156882bc227))
* resolve infinite loop in usechalo hook by using selectors and value checks ([ab50a00](https://github.com/osiloke/chalo/commit/ab50a006721a640236abb347e81f5e90481abce8))
* scroll action targets the fullName input field in demo ([0b4ebec](https://github.com/osiloke/chalo/commit/0b4ebec7fa0ae498bb8dc5adfa81e64e1220565f)), closes [#dashboard-header](https://github.com/osiloke/chalo/issues/dashboard-header) [#fullName](https://github.com/osiloke/chalo/issues/fullName)
* show action labels in status bubbles and highlight scroll targets ([be2e8d1](https://github.com/osiloke/chalo/commit/be2e8d13cb0ce113a3fabe1f22504cfd11a21734))
* update CreateProjectModal to import from chalo package ([e1e380c](https://github.com/osiloke/chalo/commit/e1e380c3f3e2115783ae02a9322e2591ff1fae9b))
* use pnpm --filter syntax instead of npm -w in root scripts ([dd1a553](https://github.com/osiloke/chalo/commit/dd1a5538235a43832c3a8c1d034bd2410a2c7eef))
* use resetMission instead of reset in startMission ([42a1b4b](https://github.com/osiloke/chalo/commit/42a1b4b60b6972d6b449e242257e31d221a07f4c))


### Features

* add debug logging to useChalo hook ([a1c0180](https://github.com/osiloke/chalo/commit/a1c01808f396560ac96bcaeb0057efda9b6cb709))
* add input bubbles for chat-based field input in product tour ([a6fc922](https://github.com/osiloke/chalo/commit/a6fc9225cb159860ec0d4a3ba604b20c3ce17aa8))
* add logo generation script and SVG logo to demo assets ([343b9d6](https://github.com/osiloke/chalo/commit/343b9d624a4ef0024384932745aa154edd69006f))
* add markMissionCompleted with allowCompletion guard ([b831136](https://github.com/osiloke/chalo/commit/b831136441eb5a1cc25cd7366da4050dbba0b541))
* add modal-based product tour with target highlighting and resume prompt ([74534bd](https://github.com/osiloke/chalo/commit/74534bda59f48c508985a27a5bf210c6dd2acbf0))
* add step-level condition to gate action sequence auto-execution ([9cd9713](https://github.com/osiloke/chalo/commit/9cd971383b7982624c6102221c28d564e8e6e2f3))
* add vscode launch, tasks, and settings for monorepo ([ad70caf](https://github.com/osiloke/chalo/commit/ad70caf0279b357b229e1b9bc4a5570484d91f8f))
* implement action execution engine ([5a31909](https://github.com/osiloke/chalo/commit/5a319097cfa9298b28639e05327ff3dcdf510275))
* implement bubble-based architecture and bidirectional input control in smartdrawer ([1d7d0c1](https://github.com/osiloke/chalo/commit/1d7d0c1ddb0a432365f6cc190420d11cf05aa1a7))
* initial implementation of chalo guidance engine with push-drawer ([50c02f6](https://github.com/osiloke/chalo/commit/50c02f696906da7d5713f8c17de7d48f1665aad2))
* make auto-fill optional in product tour ([54a016b](https://github.com/osiloke/chalo/commit/54a016bce553570d64756aece238f14b14a7f45d))
* setup chalo as monorepo package library ([0f670e2](https://github.com/osiloke/chalo/commit/0f670e238d884413c6db398d09103dc5ebf2426e))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release with core components
- `useChalo` hook for state management
- `SmartDrawer` component
- `TargetHighlight` component
- Action engine for guided experiences
- Zustand-based state management
- Framer Motion animations

## [0.1.0] - 2026-04-04

### Added
- Initial project structure
- Monorepo setup with workspaces
- TypeScript support with modern declarations
- ESM and CJS builds
- GitHub Actions CI/CD with OIDC publishing
