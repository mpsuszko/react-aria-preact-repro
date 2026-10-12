# React Aria Components + Preact 11 repro

Vite app using `react-aria-components` 1.22.1 with Preact 11.0.1. `@preact/preset-vite` aliases `react` / `react-dom` to `preact/compat`.

```sh
npm install
npm run dev
```

## Stock (`/`)

Both collection components throw on mount:

```
TypeError: <doc>.createElementNS is not a function
```

Preact 11 creates nodes through `parentDom.ownerDocument.createElementNS()` / `createTextNode()`. Inside a collection, `parentDom` is React Aria's fake `Document`, which does not implement these methods.

## With `?shim=dom`

`?shim=dom` adds only the missing fake-DOM methods (`createElementNS`, `createTextNode`, `remove`). This is not a fix; it lets the next two problems show up:

1. **Insertion order.** Click "Insert X, Y between A and B".
   - Expected: `A X Y B`.
   - Actual: `A X B Y`.
2. **Keyboard.** Focus the Select button and press ArrowDown.
   - Expected: the list opens.
   - Actual: nothing happens, and each keydown throws `Cannot read properties of undefined (reading 'length')`.
   - Opening the list with a click works.
