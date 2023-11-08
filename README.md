# WBook

A tiny and beautiful txt to epub converter, with toc and metadata combined, written in Rust and Typescript.

## Features

- PreProcess and PostProcess support
- Send to Kindle support
- Customizable TOC, Metadata and Content in each chapter
- Simple but powerful template engine, based on DJANGO2 template engine

## Requirements

- Rust 1.70+
- LLVM 11+
- NodeJS 18+
- PNPM 6.0+

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
