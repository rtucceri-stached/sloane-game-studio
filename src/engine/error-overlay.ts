/* ============================================================
 * ERROR OVERLAY — in-canvas runtime error display
 * ------------------------------------------------------------
 * Subscribes to uncaught window errors and unhandled promise
 * rejections. Draws a translucent dark-red panel at the top of
 * the canvas. Manual errors can be reported via report().
 * Press D to dismiss all entries.
 * ============================================================ */

interface OverlayEntry {
  message: string;
  source: string;
  timestamp: string;
  stack: string;
}

const MAX_ENTRIES = 5;
const LINE_H = 18;
const PADDING = 12;

const _entries: OverlayEntry[] = [];

function _add(message: string, source: string, stack: string): void {
  const d = new Date();
  const ts =
    `${d.getHours().toString().padStart(2, '0')}:` +
    `${d.getMinutes().toString().padStart(2, '0')}:` +
    `${d.getSeconds().toString().padStart(2, '0')}`;
  _entries.unshift({ message, source, timestamp: ts, stack });
  if (_entries.length > MAX_ENTRIES) _entries.pop();
}

export const ErrorOverlay = {
  init(): void {
    window.addEventListener('error', (e: ErrorEvent) => {
      const fname = e.filename ? (e.filename.split('/').pop() ?? e.filename) : '?';
      const src = e.lineno ? `${fname}:${e.lineno}` : fname;
      const stack = e.error instanceof Error ? (e.error.stack ?? '') : '';
      _add(e.message ?? 'Unknown error', src, stack);
    });

    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason);
      const stack = e.reason instanceof Error ? (e.reason.stack ?? '') : '';
      _add(msg, 'promise', stack);
    });

    // D-key dismiss — raw listener, intentionally bypasses Input system
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') ErrorOverlay.dismiss();
    });
  },

  report(message: string, source: string = 'assets'): void {
    _add(message, source, '');
  },

  dismiss(): void {
    _entries.length = 0;
  },

  draw(ctx: CanvasRenderingContext2D, W: number, H: number): void {
    if (_entries.length === 0) return;

    const MAX_PANEL_H = H * 0.3;
    // 2 lines per entry (message + optional stack frame) plus spacing
    const rawH = PADDING * 2 + 20 + _entries.length * (LINE_H * 2 + 4);
    const panelH = Math.min(rawH, MAX_PANEL_H);

    ctx.save();
    ctx.fillStyle = 'rgba(80, 0, 0, 0.90)';
    ctx.fillRect(0, 0, W, panelH);

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ff8888';
    ctx.fillText('RUNTIME ERROR  —  press D to dismiss', PADDING, PADDING);

    ctx.font = '11px monospace';
    let y = PADDING + 20;

    for (const ent of _entries) {
      if (y + LINE_H > panelH - 4) break;

      ctx.fillStyle = '#ffffff';
      const msg = `[${ent.timestamp}] ${ent.source}  ${ent.message}`.slice(0, 110);
      ctx.fillText(msg, PADDING, y);
      y += LINE_H;

      if (ent.stack && y + LINE_H <= panelH - 4) {
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        const frame =
          ent.stack
            .split('\n')
            .slice(1)
            .find((l) => l.trim()) ?? '';
        ctx.fillText(`  ${frame.trim()}`.slice(0, 110), PADDING, y);
        y += LINE_H;
      }
      y += 4;
    }

    ctx.restore();
  },
};
