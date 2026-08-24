# ModalA11yRepro

Minimal reproducer for a React Native (new architecture / Fabric) iOS bug:
**Modal content vanishes from the accessibility tree on repeated
present/dismiss cycles** — the modal renders on screen and touch works, but
XCUITest/VoiceOver see only status-bar elements.

Bare `@react-native-community/cli init` template (RN 0.86.2). The only
changes: `App.tsx` (a button presenting a transparent slide-animation Modal
with a close button) and the Maestro flows below.

## Reproduce

Requirements: Xcode + an iOS simulator, [Maestro](https://maestro.mobile.dev)
(any XCUITest-based driver shows the same thing).

```sh
npm install
cd ios && pod install && cd ..
npx react-native run-ios --mode Debug   # Debug matters: Release did not repro in 40 cycles
```

Then drive open → close → open with accessibility-driven taps:

```sh
maestro test cycle.yaml   # cycle 1: passes
maestro test cycle.yaml   # cycle 2: fails — modal is on screen, but
                          # "CLOSE" is not in the accessibility tree
maestro hierarchy         # ground truth: only status-bar elements remain
```

Observed behavior (iPhone 17 / iOS 26.2 sim, Xcode 26.6, Maestro 2.4.0):

- Presentation 1 is fully accessible; presentation 2 renders but registers
  nothing in the AX tree. Deterministic after every fresh app launch.
- Touch still works: `maestro test close-by-point.yaml` dismisses the modal
  by coordinates and the accessibility tree is fully restored.
- Presenting again after that heal is blind again (`open-only.yaml`).
- The state lives in the app process: each `maestro test` above is its own
  driver process, and a fresh runner still sees the blind tree.

## Files

- `App.tsx` — the reproducer UI
- `cycle.yaml` — one open/close cycle via AX taps (3s settles)
- `open-only.yaml` — present and assert the modal content is accessible
- `close-by-point.yaml` — dismiss by raw coordinates (bypasses the AX tree)
