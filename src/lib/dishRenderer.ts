import type { AntibioticDisc, Bacterium, ConjugationLine } from "@/types";

export const DISH_SIZE = 520;
export const AGAR_RADIUS = 240;
export const TRANSFER_HIGHLIGHT_TICKS = 90;
const TAU = Math.PI * 2;

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
}

function surface(size: number, density = 2) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size * density;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(density, density);
  return { canvas, ctx };
}

// Build lighting and textures once. No decorative effect consumes simulation RNG.
function makeDish() {
  const { canvas, ctx } = surface(DISH_SIZE);
  ctx.translate(260, 260);
  const glass = ctx.createLinearGradient(-200, -250, 170, 260);
  glass.addColorStop(0, "#fffef6");
  glass.addColorStop(0.25, "#a5b0a0");
  glass.addColorStop(0.5, "#f5f3df");
  glass.addColorStop(0.8, "#7c8d7c");
  glass.addColorStop(1, "#dce0ce");
  ctx.fillStyle = glass;
  circle(ctx, 0, 0, 253);
  ctx.fill();
  ctx.strokeStyle = "#70816c88";
  ctx.lineWidth = 1;
  ctx.stroke();

  const agar = ctx.createRadialGradient(-95, -115, 15, 10, 20, 290);
  agar.addColorStop(0, "#f6f0cb");
  agar.addColorStop(0.5, "#e9e3b7");
  agar.addColorStop(0.84, "#d5d6ad");
  agar.addColorStop(1, "#a3b395");
  circle(ctx, 0, 0, AGAR_RADIUS);
  ctx.fillStyle = agar;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // Deterministic low-contrast grain: independent of biology and refresh rate.
  for (let i = 0; i < 9000; i++) {
    const r = Math.sqrt((i * 0.61803398875) % 1) * AGAR_RADIUS;
    const angle = i * 2.3999632297;
    ctx.fillStyle = i % 3 ? "#6c775709" : "#fffef629";
    ctx.fillRect(Math.cos(angle) * r, Math.sin(angle) * r, 0.7, 0.7);
  }
  ctx.restore();
  ctx.strokeStyle = "#62775966";
  ctx.lineWidth = 2;
  circle(ctx, 0, 0, 240);
  ctx.stroke();
  for (const [radius, color, width] of [[245, "#fffef5bb", 2], [250, "#ffffff88", 1]] as const) {
    circle(ctx, 0, 0, radius);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, 248, Math.PI * 1.08, Math.PI * 1.66);
  ctx.strokeStyle = "#ffffffee";
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 247, Math.PI * 0.04, Math.PI * 0.39);
  ctx.strokeStyle = "#ffffef99";
  ctx.lineWidth = 2;
  ctx.stroke();
  return canvas;
}

function makeCell(resistant: boolean, rotation: number) {
  const { canvas, ctx } = surface(24);
  ctx.translate(12, 12);
  ctx.rotate(rotation);
  const width = resistant ? 11 : 9;
  const height = resistant ? 6 : 4.5;
  ctx.fillStyle = "#263b3326";
  ctx.beginPath();
  ctx.roundRect(-width / 2 + 0.8, -height / 2 + 1.3, width, height, height / 2);
  ctx.fill();
  const light = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
  light.addColorStop(0, resistant ? "#ecb393" : "#a5b79a");
  light.addColorStop(0.45, resistant ? "#d16b4d" : "#527662");
  light.addColorStop(1, resistant ? "#8f422c" : "#254536");
  ctx.fillStyle = light;
  ctx.strokeStyle = resistant ? "#88442f" : "#294c3b";
  ctx.lineWidth = 0.65;
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, height / 2);
  ctx.fill();
  ctx.stroke();
  // Resistant cells carry two pale bands; susceptible cells have one axial glint.
  ctx.strokeStyle = resistant ? "#fff2dc" : "#d8e5cd";
  ctx.lineWidth = resistant ? 1.2 : 0.7;
  ctx.beginPath();
  if (resistant) {
    for (const x of [-2, 2]) { ctx.moveTo(x, -1.6); ctx.lineTo(x, 1.6); }
  } else {
    ctx.moveTo(-2.5, -0.9); ctx.lineTo(1.5, -0.9);
  }
  ctx.stroke();
  return canvas;
}

export class DishRenderer {
  private dish = makeDish();
  private sprites = [false, true].map(resistant =>
    Array.from({ length: 16 }, (_, i) => makeCell(resistant, i * Math.PI / 16)));
  private orientations = new WeakMap<Bacterium, number>();
  private nextOrientation = 0;
  private deaths: { x: number; y: number; frame: number; resistant: boolean; orientation: number }[] = [];

  reset() {
    this.deaths = [];
    this.orientations = new WeakMap();
    this.nextOrientation = 0;
  }

  private orientation(b: Bacterium) {
    let value = this.orientations.get(b);
    if (value === undefined) {
      value = (this.nextOrientation++ * 7) % 16;
      this.orientations.set(b, value);
    }
    return value;
  }

  recordDeath(b: Bacterium, frame: number) {
    if (this.deaths.length >= 200) this.deaths.shift();
    this.deaths.push({ x: b.pos.x, y: b.pos.y, frame, resistant: b.isResistant, orientation: this.orientation(b) });
  }

  render(ctx: CanvasRenderingContext2D, bacteria: Bacterium[], discs: AntibioticDisc[],
    lines: ConjugationLine[], frame: number, advanced: boolean, reducedMotion: boolean,
    cursor: { x: number; y: number } | null, discRadius: number) {
    ctx.clearRect(0, 0, DISH_SIZE, DISH_SIZE);
    ctx.drawImage(this.dish, 0, 0, DISH_SIZE, DISH_SIZE);
    ctx.save();
    ctx.translate(260, 260);
    circle(ctx, 0, 0, AGAR_RADIUS);
    ctx.clip();

    for (const disc of discs) {
      const { x, y } = disc.pos;
      if (advanced) {
        const halo = ctx.createRadialGradient(x, y, disc.radius, x, y, disc.radius + 20);
        halo.addColorStop(0, "#bc854d30");
        halo.addColorStop(1, "#bc854d08");
        ctx.fillStyle = halo;
        circle(ctx, x, y, disc.radius + 20);
        ctx.fill();
        ctx.strokeStyle = "#8f694c88";
        ctx.setLineDash([2, 4]);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      circle(ctx, x, y, disc.radius);
      ctx.fillStyle = "#fffdf24a";
      ctx.fill();
      ctx.strokeStyle = "#53685bb0";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const b of bacteria) {
      const birthScale = reducedMotion ? 1 : 0.65 + Math.min(b.age / 18, 1) * 0.35;
      ctx.globalAlpha = 0.4 + Math.max(0, b.health) / 100 * 0.6;
      const size = 24 * birthScale;
      ctx.drawImage(this.sprites[b.isResistant ? 1 : 0][this.orientation(b)], b.pos.x - size / 2, b.pos.y - size / 2, size, size);
    }
    this.deaths = this.deaths.filter(d => frame - d.frame < 18);
    if (!reducedMotion) for (const d of this.deaths) {
      ctx.globalAlpha = (1 - (frame - d.frame) / 18) * 0.35;
      ctx.drawImage(this.sprites[d.resistant ? 1 : 0][d.orientation], d.x - 12, d.y - 12, 24, 24);
    }
    ctx.globalAlpha = 1;

    if (advanced && lines.length) {
      const alive = new Set(bacteria);
      for (const line of lines) {
        if (line.recipient && !alive.has(line.recipient)) continue;
        if (line.donor && !alive.has(line.donor)) continue;
        const from = line.donor?.pos || { x: line.fromX, y: line.fromY };
        const to = line.recipient?.pos || { x: line.toX, y: line.toY };
        // A restrained filament marks transfer without drawing a ring around the cell.
        ctx.globalAlpha = 0.85 * (reducedMotion ? 1 : Math.min(1, line.framesLeft / 30));
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo((from.x + to.x) / 2 + 3, (from.y + to.y) / 2 - 5, to.x, to.y);
        ctx.strokeStyle = "#79449f";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Paper discs stay above the cells. The dashed region is the actual model boundary.
    for (const disc of discs) {
      const { x, y } = disc.pos;
      circle(ctx, x + 1, y + 2, 10);
      ctx.fillStyle = "#344b3933";
      ctx.fill();
      const paper = ctx.createLinearGradient(x - 6, y - 9, x + 6, y + 9);
      paper.addColorStop(0, "#fffef8");
      paper.addColorStop(1, "#e5ddc6");
      circle(ctx, x, y, 9);
      ctx.fillStyle = paper;
      ctx.fill();
      ctx.strokeStyle = "#ffffffcc";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "#596651";
      ctx.font = "bold 6px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("AB", x, y + 0.5);
    }
    if (cursor) {
      ctx.strokeStyle = "#294c3baa";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      circle(ctx, cursor.x, cursor.y, discRadius);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cursor.x - 5, cursor.y); ctx.lineTo(cursor.x + 5, cursor.y);
      ctx.moveTo(cursor.x, cursor.y - 5); ctx.lineTo(cursor.x, cursor.y + 5);
      ctx.stroke();
    }
    ctx.restore();
  }
}
