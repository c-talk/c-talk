# C Talk

A simple beautiful Instant Messaging App based on Tauri and React.
**Please note**: Currently this project is in heavy development and not ready for production use.

![alt](./.github/assets/overviews.png)

## Features

- Built with Tauri and React
  - Local cache and database are planned to be implemented
- Instant interactions - data fetching are instant, and more!
- Cross platform support
  - Windows, macOS, Linux, and upcoming Android, ios support, provided by Tauri
  - Web support via a hooks adapter to call hooks either Tauri api or a browser api.
- Smooth animation and element transitions.
- Customizable theme and color scheme. - are planned to be implemented
- Support for multiple languages. - are planned to be implemented
- Support for multiple accounts. - are planned to be implemented
- Support for multiple devices. - are planned to be implemented

## Requirements

- Rust 1.78+
- LLVM 11+
- NodeJS 20+
- PNPM 9.0+

## Installation

Wait for a while, we will release a binary version for Windows, Linux and MacOS.

## Development

```bash
git clone
cd wbook
pnpm install
pnpm tauri dev
```

## Build

```bash
pnpm tauri build
```

## License

Licensed under LGPL-3.0 License. See [LICENSE](LICENSE) for more information.
