/* ============================================================
 * SLOANE & DAD INPUT MANAGER  v0.2  (ES module port)
 * ------------------------------------------------------------
 * One object that knows about ALL controls.
 *   ✅ Keyboard
 *   ✅ Touch (virtual D-pad + action button)
 *   ✅ Gamepads (XInput layout — Xbox, PlayStation, most BT controllers)
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
  const KEY_BINDINGS: Record<string, string[]> = {
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    action: ['Space', 'Enter'],
    pause: ['Escape', 'KeyP'],
  };

  // -- State ----------------------------------------------------
  // Keyboard
  const keysDown = new Set();
  const keysPressedThisFrame = new Set();
  const keysReleasedThisFrame = new Set();
  // Touch
  const touchActionsDown = new Set();
  const touchActionsPressedThisFrame = new Set();
  // Gamepad — populated by pollGamepads() each frame.
  const gamepadActionsDown = new Set();
  const gamepadActionsPressedThisFrame = new Set();

  // -- Gamepad bindings (XInput layout) ------------------------
  // Standard Gamepad mapping is what `navigator.getGamepads()` returns
  // for any controller it recognizes (Xbox, PS, most BT pads).
  const GAMEPAD_BUTTONS: Record<string, number> = {
    action: 0, // A / Cross
    cancel: 1, // B / Circle
    menu: 9, // Start / Options
    up: 12,
    down: 13,
    left: 14,
    right: 15,
  };
  const GAMEPAD_DEADZONE = 0.5;

  // -- Keyboard wiring -----------------------------------------
  window.addEventListener('keydown', (e) => {
    if (!keysDown.has(e.code)) keysPressedThisFrame.add(e.code);
    keysDown.add(e.code);
    // Stop browser scrolling on arrow keys / space when a game is focused.
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  });
  window.addEventListener('keyup', (e) => {
    keysDown.delete(e.code);
    keysReleasedThisFrame.add(e.code);
  });

  // -- Public API ----------------------------------------------
  function isDown(action: string): boolean {
    const keys = KEY_BINDINGS[action];
    if (keys && keys.some((k) => keysDown.has(k))) return true;
    if (touchActionsDown.has(action)) return true;
    if (gamepadActionsDown.has(action)) return true;
    return false;
  }

  function wasPressed(action: string): boolean {
    const keys = KEY_BINDINGS[action];
    if (keys && keys.some((k) => keysPressedThisFrame.has(k))) return true;
    if (touchActionsPressedThisFrame.has(action)) return true;
    if (gamepadActionsPressedThisFrame.has(action)) return true;
    return false;
  }

  function wasReleased(action: string): boolean {
    const keys = KEY_BINDINGS[action];
    if (!keys) return false;
    return keys.some((k) => keysReleasedThisFrame.has(k));
  }

  // Call once per frame at the END of update().
  function endFrame() {
    // Poll gamepads BEFORE clearing per-frame markers — keyboard/touch
    // get their press flags from events that fired during the frame; the
    // gamepad layer needs us to refresh those flags itself.
    pollGamepads();
    keysPressedThisFrame.clear();
    keysReleasedThisFrame.clear();
    touchActionsPressedThisFrame.clear();
  }

  function bind(action: string, keys: string | string[]): void {
    KEY_BINDINGS[action] = Array.isArray(keys) ? keys : [keys];
  }

  // -- Gamepad polling -----------------------------------------
  // The Gamepad API has no events — we read state every frame.
  // We diff this frame's "currently down" actions against the prior
  // frame's to compute "just pressed."
  function pollGamepads() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let pad = null;
    for (const p of pads) {
      if (p) {
        pad = p;
        break;
      }
    }

    const nowDown = new Set();
    if (pad) {
      // Buttons
      for (const action in GAMEPAD_BUTTONS) {
        const btn = pad.buttons[GAMEPAD_BUTTONS[action]];
        if (btn && btn.pressed) nowDown.add(action);
      }
      // Left stick — XInput layout: axis 0 = X, axis 1 = Y, Y down is positive.
      const lx = pad.axes[0] || 0;
      const ly = pad.axes[1] || 0;
      if (lx < -GAMEPAD_DEADZONE) nowDown.add('left');
      if (lx > GAMEPAD_DEADZONE) nowDown.add('right');
      if (ly < -GAMEPAD_DEADZONE) nowDown.add('up');
      if (ly > GAMEPAD_DEADZONE) nowDown.add('down');
    }

    // "Just pressed" = in nowDown, NOT in previous frame's down set.
    gamepadActionsPressedThisFrame.clear();
    for (const action of nowDown) {
      if (!gamepadActionsDown.has(action)) {
        gamepadActionsPressedThisFrame.add(action);
      }
    }

    // Replace the persistent "down" set with this frame's snapshot.
    gamepadActionsDown.clear();
    for (const action of nowDown) gamepadActionsDown.add(action);
  }

  function hasGamepad() {
    if (!navigator.getGamepads) return false;
    const pads = navigator.getGamepads();
    for (const p of pads) {
      if (p) return true;
    }
    return false;
  }

  // -- Touch controls ------------------------------------------
  // Creates an on-screen D-pad + action button. Only appears on
  // touch devices, so it doesn't get in the way on desktop.
  let _touchEnabled = false;
  function enableTouchControls(opts: { dpad?: boolean; actionBtn?: boolean } = {}): void {
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
        { action: 'up', col: 2, row: 1, label: '▲' },
        { action: 'left', col: 1, row: 2, label: '◀' },
        { action: 'right', col: 3, row: 2, label: '▶' },
        { action: 'down', col: 2, row: 3, label: '▼' },
      ];
      layout.forEach((p) => {
        const b = _makeTouchButton(p.action, p.label);
        b.style.gridColumn = String(p.col);
        b.style.gridRow = String(p.row);
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

  function _makeTouchButton(action: string, label: string): HTMLDivElement {
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
    const press = (e: Event): void => {
      e.preventDefault();
      if (!touchActionsDown.has(action)) touchActionsPressedThisFrame.add(action);
      touchActionsDown.add(action);
      btn.style.background = 'rgba(255,255,255,0.4)';
    };
    const release = (e: Event): void => {
      e.preventDefault();
      touchActionsDown.delete(action);
      btn.style.background = 'rgba(255,255,255,0.18)';
    };
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
    return btn;
  }

  return {
    isDown,
    wasPressed,
    wasReleased,
    endFrame,
    bind,
    enableTouchControls,
    hasGamepad,
  };
})();
