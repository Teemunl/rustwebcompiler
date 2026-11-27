# rustwebcompiler

A no-build, static browser experiment: handwritten JavaScript emits tiny WebAssembly modules at runtime and links functions through a shared table. No Rust toolchain, Node.js, wasm-bindgen, wasm-opt, or external libraries are used by the page.

## Run

Open `index.html` from a static web server, or publish the folder with GitHub Pages. The page runs the lazy Fibonacci and hot-swap demo on load.

## Current checkpoint

The demo covers the hand-written Wasm emitter, a lazy compilation stub, recursive calls through the shared table, and replacing a function at runtime. The Rust-subset lexer, parser, type checker, and later roadmap milestones are not implemented yet.
