# Mazatrol QuickView Desktop

Mazatrol QuickView is an experimental desktop viewer for selected Mazatrol binary formats and text-based CNC programs.

**Version:** 0.1.23 · **Frontend:** v1.5.103 · **Status:** early prototype

## Features

- Read-only viewing of selected Mazatrol binary formats.
- Open selected G-code, ISO/EIA, MPF, H and other text formats.
- Schematic toolpath previews for selected dialect subsets.
- Edit text programs and save a separate copy.
- Save binary Mazatrol files as a byte-for-byte copy.
- Toggle dimming of control-mode processes in the viewer.
- Polish and English interface.

### Known limitation: control-mode blocks

Turning off dimming changes only how control-mode processes appear in QuickView. Saving a Mazatrol file creates a byte-for-byte copy and does not clear or rewrite the control flag. CAM software may therefore continue to show that process as disabled. This is planned for future investigation; the saved copy is not rewritten or validated for CAM or machine use.

## Build from source

Requirements: Node.js with npm, Rust stable/Cargo (Rust 1.90 or newer), and platform build dependencies for Tauri 2.

```sh
npm ci
npm run dev
```

Build a package for the current operating system:

```sh
npm run build
```

Build and verify Windows, macOS and Linux packages on their respective systems. See the GitHub Actions workflow for the current CI build matrix. CI builds packages; it does not publish releases or sign installers.

## Platform requirements

- **Windows:** Microsoft C++ Build Tools and WebView2.
- **macOS:** Xcode Command Line Tools; build on macOS.
- **Linux:** WebKitGTK 4.1, GTK/appindicator development packages, librsvg, patchelf and xdg-utils. Package names vary by distribution.

## Format and preview limitations

File extensions alone do not establish controller dialect. Parsing and graphics support only the implemented subsets for each format. Cycles, macros, offsets and machine-specific transformations may not be interpreted. The preview is schematic; it is not a CAM system, controller simulator or program verification tool. Always verify programs using the relevant machine documentation and simulation before machining.

See `SOURCES.md` and `THIRD_PARTY_NOTICES.md` for source and attribution details. See `CHANGELOG.md` for version history.

## Example programs

The `examples/` directory contains reviewed sample programs for parser and display demonstrations. Treat these as test material only; they do not establish full compatibility with a controller or machine.

## License

This project includes components under GPL-2.0-only and third-party code or data under their respective licenses. See `LICENSE` and `THIRD_PARTY_NOTICES.md`. Preserve the relevant notices when redistributing.
