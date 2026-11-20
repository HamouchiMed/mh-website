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

export function drawLed(ctx: CanvasRenderingContext2D, w: number, h: number, raster: Raster, o: LedOptions) {
  const { rows, on, w: tw } = raster;
  ctx.fillStyle = "#050509";
  ctx.fillRect(0, 0, w, h);
  const pitch = o.pitch;
  const cols = Math.ceil(w / pitch) + 1;
  const top = (h - rows * pitch) / 2;
  const r = pitch * 0.36;
  const lit = new Path2D(), dim = new Path2D(), glow = new Path2D(), hot = new Path2D();
  const reach2 = o.reach * o.reach;
  const off = Math.floor(o.offset);
  const tick = Math.floor(o.t * 8);
  for (let row = 0; row < rows; row++) {
    const cy = top + (row + 0.5) * pitch;
    for (let col = 0; col < cols; col++) {
      const cx = (col + 0.5) * pitch;
      const sx = o.loop ? (((col + off) % tw) + tw) % tw : col - (o.startCol ?? 0);
      const isOn = sx >= 0 && sx < tw && on[row * tw + sx] === 1;
      const near = (cx - o.mx) ** 2 + (cy - o.my) ** 2 < reach2;
      const sweep = o.sweep != null && Math.abs(col - o.sweep) < 1.5;
      let p = dim;
      if (isOn) p = near || sweep ? hot : lit;
      else if (near && (col * 7 + row * 13 + tick) % 5 === 0) p = lit;
      p.moveTo(cx + r, cy);
      p.arc(cx, cy, r, 0, Math.PI * 2);
      if (p !== dim) {
        glow.moveTo(cx + r * 2.3, cy);
        glow.arc(cx, cy, r * 2.3, 0, Math.PI * 2);
      }
    }
  }
  ctx.fillStyle = "#15172e";
  ctx.fill(dim);
  ctx.fillStyle = "rgba(104,116,255,0.16)";
  ctx.fill(glow);
  ctx.fillStyle = "#8f9bff";
  ctx.fill(lit);
  ctx.fillStyle = "#ffffff";
  ctx.fill(hot);
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
