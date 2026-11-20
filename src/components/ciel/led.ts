// Dot-matrix LED rendering shared by the services band and the footer sign:
// text is rasterised once into a grid of on/off dots, then drawn as round
// LEDs. Dots near the pointer light up, and an optional sweep column glows.

export type Raster = { w: number; rows: number; on: Uint8Array };

export function rasterize(text: string, rows: number): Raster {
  const font = `700 ${Math.round(rows * 0.92)}px ${getComputedStyle(document.body).fontFamily}`;
  const c = document.createElement("canvas");
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.font = font;
  const w = Math.ceil(x.measureText(text).width) + 4;
  c.width = w;
  c.height = rows;
  x.font = font;
  x.fillStyle = "#fff";
  x.textBaseline = "middle";
  x.fillText(text, 2, rows / 2 + 0.5);
  const d = x.getImageData(0, 0, w, rows).data;
  const on = new Uint8Array(w * rows);
  for (let i = 0; i < on.length; i++) on[i] = d[i * 4 + 3] > 110 ? 1 : 0;
  return { w, rows, on };
}

export type LedOptions = {
  pitch: number; // distance between dots, device px
  offset: number; // scroll position of the text, in columns (looping text)
  loop: boolean;
  startCol?: number; // where a non-looping text starts
  mx: number; // pointer, device px (-1e4 when away)
  my: number;
  reach: number; // pointer radius, device px
  sweep?: number | null; // a glowing column
  t: number;
};

// A painter for one canvas. The unlit grid is drawn once per size into a
// hidden canvas; each frame copies it and adds only the lit dots. A frame
// identical to the previous one (same text position, sweep column and
// pointer cell) is skipped. Returns whether it painted.
export function ledPainter() {
  let grid: HTMLCanvasElement | null = null;
  let gridKey = "";
  let lastKey = "";
  let lastRaster: Raster | null = null;
  return (ctx: CanvasRenderingContext2D, w: number, h: number, raster: Raster, o: LedOptions) => {
    const { rows, on, w: tw } = raster;
    const pitch = o.pitch;
    const cols = Math.ceil(w / pitch) + 1;
    const top = (h - rows * pitch) / 2;
    const r = pitch * 0.36;
    const off = Math.floor(o.offset);
    const tick = Math.floor(o.t * 8);
    const near = o.mx > -o.reach && o.mx < w + o.reach && o.my > -o.reach && o.my < h + o.reach;
    const sweepCol = o.sweep == null ? -1 : Math.round(o.sweep);
    const key = `${w}x${h}|${off}|${sweepCol}|${near ? `${Math.round(o.mx / pitch)},${Math.round(o.my / pitch)},${tick}` : "-"}`;
    if (key === lastKey && raster === lastRaster) return false;
    lastKey = key;
    lastRaster = raster;

    const size = `${w}x${h}|${pitch}|${rows}`;
    if (size !== gridKey || !grid) {
      grid = document.createElement("canvas");
      grid.width = w;
      grid.height = h;
      const g = grid.getContext("2d")!;
      g.fillStyle = "#050509";
      g.fillRect(0, 0, w, h);
      const dots = new Path2D();
      for (let row = 0; row < rows; row++) {
        const cy = top + (row + 0.5) * pitch;
        for (let col = 0; col < cols; col++) {
          const cx = (col + 0.5) * pitch;
          dots.moveTo(cx + r, cy);
          dots.arc(cx, cy, r, 0, Math.PI * 2);
        }
      }
      g.fillStyle = "#15172e";
      g.fill(dots);
      gridKey = size;
    }
    ctx.drawImage(grid, 0, 0);

    const lit = new Path2D(), glow = new Path2D(), hot = new Path2D();
    const reach2 = o.reach * o.reach;
    for (let row = 0; row < rows; row++) {
      const cy = top + (row + 0.5) * pitch;
      for (let col = 0; col < cols; col++) {
        const cx = (col + 0.5) * pitch;
        const sx = o.loop ? (((col + off) % tw) + tw) % tw : col - (o.startCol ?? 0);
        const isOn = sx >= 0 && sx < tw && on[row * tw + sx] === 1;
        const close = near && (cx - o.mx) ** 2 + (cy - o.my) ** 2 < reach2;
        let p: Path2D | null = null;
        if (isOn) p = close || Math.abs(col - sweepCol) < 1.5 ? hot : lit;
        else if (close && (col * 7 + row * 13 + tick) % 5 === 0) p = lit;
        if (!p) continue;
        p.moveTo(cx + r, cy);
        p.arc(cx, cy, r, 0, Math.PI * 2);
        glow.moveTo(cx + r * 2.3, cy);
        glow.arc(cx, cy, r * 2.3, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = "rgba(104,116,255,0.16)";
    ctx.fill(glow);
    ctx.fillStyle = "#8f9bff";
    ctx.fill(lit);
    ctx.fillStyle = "#ffffff";
    ctx.fill(hot);
    return true;
  };
}

// A canvas sized to its box at the device pixel ratio (capped).
export function fitCanvas(canvas: HTMLCanvasElement) {
  const scale = Math.min(window.devicePixelRatio || 1, 1.5);
  const r = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width * scale));
  const h = Math.max(1, Math.round(r.height * scale));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  return { w, h, scale, rect: r };
}
