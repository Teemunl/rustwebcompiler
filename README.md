# rustwebcompiler

A no-build Rust-subset compiler that runs in the browser. The single `index.html` file contains the lexer, Pratt parser, type checker, Wasm emitter, runtime, and UI. It uses native browser APIs only; there are no external libraries or build tools.

Each function is emitted as a small Wasm module and compiled lazily through a shared table; unchanged modules are kept across runs.

Supported syntax and current limitations are listed in the page under **Supported subset**.
