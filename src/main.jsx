import { Component, options, render } from 'preact';
import { useState } from 'preact/hooks';
import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue } from 'react-aria-components';

const shim = new URLSearchParams(location.search).get('shim');

if (shim === 'dom') {
  // Adds only the DOM methods Preact calls on React Aria's collection fake DOM, so the other
  // issues become observable. This is not a fix. The fake Document is not exported, so it is
  // patched when the first portal into it is created.
  let patched = false;
  const isFakeDocument = (value) =>
    value && value.nodeType === 11 && typeof value.createElement === 'function' && !value.createElementNS;
  const previousVnode = options.vnode;
  options.vnode = (vnode) => {
    const container = !patched && vnode.props && Object.values(vnode.props).find(isFakeDocument);
    if (container) {
      patched = true;
      const documentProto = Object.getPrototypeOf(container);
      const elementProto = Object.getPrototypeOf(container.createElement('probe'));
      documentProto.createElementNS = function (namespace, type) {
        return this.createElement(type);
      };
      documentProto.createTextNode = function (data) {
        const node = this.createElement('#text');
        node.isHidden = true;
        node.data = data;
        return node;
      };
      elementProto.remove = function () {
        this.parentNode?.removeChild(this);
      };
    }
    previousVnode?.(vnode);
  };
}

class Boundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    return this.state.error ? (
      <p class="error" id={`${this.props.id}-error`}>
        {String(this.state.error)}
      </p>
    ) : (
      this.props.children
    );
  }
}

function InsertOrder() {
  const [ids, setIds] = useState(['A', 'B']);
  return (
    <section>
      <h2>1. Inserting items in the middle of a collection</h2>
      <p>
        Click the button. Expected order: <b>A X Y B</b>.
      </p>
      <button type="button" id="insert" onClick={() => setIds(['A', 'X', 'Y', 'B'])}>
        Insert X, Y between A and B
      </button>
      <Boundary id="order">
        <ListBox aria-label="Items" id="order-list">
          {ids.map((id) => (
            <ListBoxItem key={id} id={id}>
              {id}
            </ListBoxItem>
          ))}
        </ListBox>
      </Boundary>
    </section>
  );
}

function KeyboardSelect() {
  return (
    <section>
      <h2>2. Keyboard</h2>
      <p>
        Focus the Select button with Tab and press <b>ArrowDown</b>. Expected: the list opens.
      </p>
      <Boundary id="select">
        <Select aria-label="Fruit" id="select">
          <Button id="select-trigger">
            <SelectValue />
          </Button>
          <Popover>
            <ListBox>
              <ListBoxItem id="apple">Apple</ListBoxItem>
              <ListBoxItem id="banana">Banana</ListBoxItem>
            </ListBox>
          </Popover>
        </Select>
      </Boundary>
    </section>
  );
}

function App() {
  return (
    <>
      <h1>React Aria Components + Preact 11 (preact/compat)</h1>
      <p>
        Mode: <b>{shim === 'dom' ? 'shim=dom (fake DOM methods added)' : 'stock'}</b>.{' '}
        <a href="?">stock</a> · <a href="?shim=dom">?shim=dom</a>
      </p>
      <InsertOrder />
      <KeyboardSelect />
    </>
  );
}

window.addEventListener('error', (e) => console.error('window error:', e.message));
render(<App />, document.getElementById('app'));
