// slot-jit-demo.mjs — one wasm module per function, linked through a shared table.
// Tested on Node 22. Run: node slot-jit-demo.mjs
// Shows: hand-rolled wasm emitter, lazy stubs (compile on first call), self-recursion via table, hot swap.
const enc = new TextEncoder();
const u = n => { const o = []; do { let b = n & 127; n >>>= 7; if (n) b |= 128; o.push(b); } while (n); return o; };
const sleb = n => { const o = []; for (;;) { const b = n & 127; n >>= 7; if ((n === 0 && !(b & 64)) || (n === -1 && (b & 64))) { o.push(b); return o; } o.push(b | 128); } };
const vec = xs => [...u(xs.length), ...xs.flat()];
const name = t => { const b = enc.encode(t); return [...u(b.length), ...b]; };
const section = (id, body) => [id, ...u(body.length), ...body];
const I32 = 0x7f;
const fnType = (ps, rs) => [0x60, ...vec(ps.map(p => [p])), ...vec(rs.map(r => [r]))];
const imp = (m, n, d) => [...name(m), ...name(n), ...d];
const IMPORTS = [imp('env','mem',[0x02,0,0]), imp('env','tbl',[0x01,0x70,0,0]), imp('env','sp',[0x03,I32,1])];
const constI32 = v => [0x41, ...sleb(v)];

function emit({ types, extraImports = [], nFuncImports = 0, body }) {
  const code = [...vec([]), ...body, 0x0b];
  return new Uint8Array([0,0x61,0x73,0x6d, 1,0,0,0,
    ...section(1, vec(types)),
    ...section(2, vec([...IMPORTS, ...extraImports])),
    ...section(3, vec([[0]])),
    ...section(7, vec([[...name('f'), 0, ...u(nFuncImports)]])),
    ...section(10, vec([[...u(code.length), ...code]]))]);
}

const mem = new WebAssembly.Memory({ initial: 16 });
const tbl = new WebAssembly.Table({ initial: 16, element: 'anyfunc' });
const sp = new WebAssembly.Global({ value: 'i32', mutable: true }, 1 << 20);
const SIG = fnType([I32], [I32]);
const fns = {};            // id -> { sig, build() }
let compiles = 0;
const env = { mem, tbl, sp, compile: id => install(id) };
const make = bytes => new WebAssembly.Instance(new WebAssembly.Module(bytes), { env }).exports.f;

function stub(id) {
  const body = [...constI32(id), 0x10, 0, 0x20, 0, ...constI32(id), 0x11, 0, 0];
  return make(emit({ types: [SIG, fnType([I32], [])], extraImports: [imp('env','compile',[0, 1])], nFuncImports: 1, body }));
}
function install(id) { compiles++; tbl.set(id, make(fns[id].build())); }
function declare(id, build) { fns[id] = { build }; tbl.set(id, stub(id)); }

// fib calls itself through table slot 1
const fibBody = [0x20,0, ...constI32(2), 0x48, 0x04,0x7f, 0x20,0, 0x05,
  0x20,0, ...constI32(1), 0x6b, ...constI32(1), 0x11,0,0,
  0x20,0, ...constI32(2), 0x6b, ...constI32(1), 0x11,0,0, 0x6a, 0x0b];
declare(1, () => emit({ types: [SIG], body: fibBody }));
console.log('fib(20) =', tbl.get(1)(20), 'compiles:', compiles);

// hot swap: redefine fib as "return n*2" (same signature) -> callers pick it up
tbl.set(1, make(emit({ types: [SIG], body: [0x20,0, ...constI32(2), 0x6c] })));
console.log('after swap fib(20) =', tbl.get(1)(20));
