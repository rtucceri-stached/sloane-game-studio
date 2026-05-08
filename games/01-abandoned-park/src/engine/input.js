/* ============================================================
 * SLOANE & DAD INPUT MANAGER  v0.2  (ES module port)
 * ------------------------------------------------------------
 * One object that knows about ALL controls.
 *   ✅ Keyboard
 *   ✅ Touch (virtual D-pad + action button)
 *   🔜 Bluetooth gamepads (see ABANDONED_PARK_PLAN.md → Controller Support)
 *
 * USAGE in a game:
 *   import { Input } from './engine/input.js';
 *   if (Input.isDown('left'))       player.x -= 5;
 *   if (Input.wasPressed('action')) jump();
 *
 *   Input.enableTouchControls();   // auto-shows D-pad on phones
 *
 *   // At the very END of every update() call:
 *   Input.endFrame();
 * ============================================================ */

export const Input = (function () {
  // -- Action -> key bindings -----------------------------------
  // Add new actions here as games need them.
  const KEY_BINDINGS = {
    left:   ['ArrowLeft',  'KeyA'],
    right:  ['ArrowRight', 'KeyD'],
    up:     ['ArrowUp',    'KeyW'],
    down:   ['ArrowDown',  'KeyS'],
    action: ['Space',      'Enter'],
    pause:  ['Escape',     'KeyP'],
  };

  // -- State ----------------------------------------------------
  // Keyboard
  const keysDown = new Set();
  const keysPressedThisFrame = new Set();
  const keysReleasedThisFrame = new Set();
  // Touch
  const touchActionsDown = new Set();
  const touchActionsPressedThisFrame = new Set();

  // -- Keyboard wiring -----------------------------------------
  window.addEventListener('keydown', (e) => {
    if (!keysDown.has(e.code)) keysPressedThisFrame.add(e.code);
    keysDown.add(e.code);
    // Stop browser scrolling on arrow keys / space when a game is focused.
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    keysDown.delete(e.code);
    keysReleasedThisFrame.add(e.code);
  });

  // -- Public API ----------------------------------------------
  function isDown(action) {
    const keys = KEY_BINDINGS[action];
    if (keys && keys.some(k => keysDown.has(k))) return true;
    if (touchActionsDown.has(action)) return true;
    // TODO: gamepad button mapped to this action
    return false;
  }

  function wasPressed(action) {
    const keys = KEY_BINDINGS[action];
    if (keys && keys.some(k => keysPressedThisFrame.has(k))) return true;
    if (touchActionsPressedThisFrame.has(action)) return true;
    return false;
  }

  function wasReleased(action) {
    const keys = KEY_BINDINGS[action];
    if (!keys) return false;
    return keys.some(k => keysReleasedThisFrame.has(k));
  }

  // Call once per frame at the END of update().
  function endFrame() {
    keysPressedThisFrame.clear();
    keysReleasedThisFrame.clear();
    touchActionsPressedThisFrame.clear();
    // TODO: poll gamepad state here
  }

  function bind(action, keys) {
    KEY_BINDINGS[action] = Array.isArray(keys) ? keys : [keys];
  }

  // -- Touch controls ------------------------------------------
  // Creates an on-screen D-pad + action button. Only appears on
  // touch devices, so it doesn't get in the way on desktop.
  let _touchEnabled = false;
  function enableTouchControls(opts = {}) {
    if (_touchEnabled) return;
    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;
    _touchEnabled = true;

    const { dpad = true, actionBtn = true } = opts;
    const root = document.createElement('div');
    root.id = 'sloane-touch-controls';
    root.style.cssText = `
      position: fixed; inset: 0; pointer-events: none;
      z-index: 9999; user-select: none; -webkit-user-select: none;
    `;

    if (dpad) {
      const pad = document.createElement('div');
      pad.style.cssText = `
        position: absolute; bottom: 24px; left: 24px;
        width: 168px; height: 168px;
        display: grid; grid-template: repeat(3, 1fr) / repeat(3, 1fr);
        gap: 4px;
      `;
      const layout = [
        { action: 'up',    col: 2, row: 1, label: '▲' },
        { action: 'left',  col: 1, row: 2, label: '◀' },
        { action: 'right', col: 3, row: 2, label: '▶' },
        { action: 'down',  col: 2, row: 3, label: '▼' },
      ];
      layout.forEach(p => {
        const b = _makeTouchButton(p.action, p.label);
        b.style.gridColumn = p.col; b.style.gridRow = p.row;
        pad.appendChild(b);
      });
      root.appendChild(pad);
    }

    if (actionBtn) {
      const b = _makeTouchButton('action', '●');
      b.style.cssText += `
        position: absolute; bottom: 56px; right: 32px;
        width: 88px; height: 88px; border-radius: 50%;
        font-size: 32px;
      `;
      root.appendChild(b);
    }

    document.body.appendChild(root);
  }

  function _makeTouchButton(action, label) {
    const btn = document.createElement('div');
    btn.textContent = label;
    btn.style.cssText = `
      background: rgba(255,255,255,0.18);
      border: 2px solid rgba(255,255,255,0.4);
      border-radius: 14px;
      color: white;
      font-size: 28px; font-weight: bold;
      display: flex; align-items: center; justify-content: center;
      pointer-events: auto; touch-action: none;
      -webkit-tap-highlight-color: transparent;
    `;
    const press = (e) => {
      e.preventDefault();
      if (!touchActionsDown.has(action)) touchActionsPressedThisFrame.add(action);
      touchActionsDown.add(action);
      btn.style.background = 'rgba(255,255,255,0.4)';
    };
    const release = (e) => {
      e.preventDefault();
      touchActionsDown.delete(action);
      btn.style.background = 'rgba(255,255,255,0.18)';
    };
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend',   release, { passive: false });
    btn.addEventListener('touchcancel',release, { passive: false });
    return btn;
  }

  return {
    isDown, wasPressed, wasReleased,
    endFrame, bind, enableTouchControls,
  };
})();
