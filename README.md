# rustwebcompiler

A compiler experiment for compiling Rust-subset functions into individual WebAssembly modules, linked at runtime through a shared function table.

## Current checkpoint

The initial demo covers the hand-written Wasm emitter, a lazy compilation stub, recursive calls through the shared table, and replacing a function at runtime. The compiler front end, multi-function linking, and subsequent roadmap milestones are not implemented yet.

## Run the demo

Requires Node.js 22.

```powershell
node .\slot-jit-demo.mjs
```

Expected output:

```text
fib(20) = 6765 compiles: 1
after swap fib(20) = 40
```
