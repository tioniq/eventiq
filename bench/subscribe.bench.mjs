// Micro-benchmark for subscribe / emit / unsubscribe cost at different subscriber counts.
// Usage: node bench/subscribe.bench.mjs [path-to-built-module]   (default: ../dist/index.js)
// `npm run bench` builds the current sources into ./tmp and runs this against them.
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

const target = process.argv[2]
  ? pathToFileURL(resolve(process.argv[2])).href
  : new URL("../dist/index.js", import.meta.url).href
const lib = await import(target)
const { Vary, EventDispatcher } = lib

const SIZES = [10, 1_000, 10_000]
const RUNS = 7

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[sorted.length >> 1]
}

// Returns the median time of one `fn` call in ms. `setup` runs outside the measured region; small sizes
// are batched over several fresh states so the timer resolution does not dominate.
function measure(n, setup, fn) {
  const batch = Math.max(1, Math.floor(20_000 / n))
  const samples = []
  for (let i = 0; i < RUNS + 2; i++) {
    const states = Array.from({ length: batch }, setup)
    const start = performance.now()
    for (const state of states) fn(state)
    const elapsed = (performance.now() - start) / batch
    if (i >= 2) samples.push(elapsed) // first two runs are warm-up
  }
  return median(samples)
}

function makeHandlers(n) {
  let sink = 0
  const handlers = new Array(n)
  for (let i = 0; i < n; i++) handlers[i] = (v) => { sink += v }
  return handlers
}

function shuffled(n) {
  const order = Array.from({ length: n }, (_, i) => i)
  let seed = 12345
  for (let i = n - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const j = seed % (i + 1)
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

function subscribed(n, create = () => new Vary(0)) {
  const v = create()
  const handlers = makeHandlers(n)
  const subs = handlers.map((h) => v.subscribeSilent(h))
  return { v, handlers, subs }
}

const EMITS = 100
const fmt = (ms, ops) => `${((ms * 1e6) / ops).toFixed(1)} ns`
const rows = []

for (const n of SIZES) {
  const sub = measure(
    n,
    () => ({ v: new Vary(0), handlers: makeHandlers(n) }),
    ({ v, handlers }) => { for (const h of handlers) v.subscribe(h) },
  )
  const order = shuffled(n)
  const unsub = measure(
    n,
    () => subscribed(n),
    ({ subs }) => { for (const i of order) subs[i].dispose() },
  )
  const emit = measure(
    n,
    () => subscribed(n),
    ({ v }) => { for (let i = 1; i <= EMITS; i++) v.value = i },
  )
  const mapEmit = measure(
    n,
    () => {
      const src = new Vary(0)
      return { src, ...subscribed(n, () => src.map((x) => x + 1)) }
    },
    ({ src }) => { for (let i = 1; i <= EMITS; i++) src.value = i },
  )
  const dispatcherSub = measure(
    n,
    () => ({ d: new EventDispatcher(), handlers: makeHandlers(n) }),
    ({ d, handlers }) => { for (const h of handlers) d.subscribe(h) },
  )
  rows.push({
    subscribers: n,
    "Vary.subscribe /op": fmt(sub, n),
    "dispose /op (random order)": fmt(unsub, n),
    "Vary emit /call": fmt(emit, EMITS * n),
    "map() emit /call": fmt(mapEmit, EMITS * n),
    "EventDispatcher.subscribe /op": fmt(dispatcherSub, n),
    "subscribe all (total)": `${(sub * 1000).toFixed(1)} µs`,
  })
}

console.log(`eventiq benchmark - ${target}`)
console.table(rows)
