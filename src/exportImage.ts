export interface ExportRating {
  value: number;
  label: string;
  color: string;
}

export interface ExportItem {
  name: string;
  category: string;
  roles: string[];
  ratings: (number | null)[];
}

const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SCALE = 2;
const PAD = 40;
const ROW_H = 34;
const RADIUS = 11;
const COL_W = 84;

function titleCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string | null,
) {
  ctx.beginPath();
  ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
  if (color) {
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
  } else {
    ctx.strokeStyle = "#b5b5bd";
  }
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function renderResultsCanvas(
  items: ExportItem[],
  ratingOptions: readonly ExportRating[],
) {
  const colorOf = (value: number | null) =>
    ratingOptions.find((option) => option.value === value)?.color ?? null;

  const groups: { category: string; items: ExportItem[] }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.category === item.category) {
      last.items.push(item);
    } else {
      groups.push({ category: item.category, items: [item] });
    }
  }

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) {
    throw new Error("Canvas is not supported in this browser.");
  }
  const textWidth = (font: string, text: string) => {
    measure.font = font;
    return measure.measureText(text).width;
  };
  const legendWidth = ratingOptions.reduce(
    (sum, option) =>
      sum + 24 + textWidth(`14px ${FONT}`, option.label) + 22,
    -22,
  );
  const contentWidth = Math.max(
    textWidth(`700 30px ${FONT}`, "kinkr results"),
    legendWidth,
    ...groups.map((group) =>
      Math.max(
        textWidth(`700 20px ${FONT}`, group.category),
        Math.max(
          ...group.items.map((item) => textWidth(`15px ${FONT}`, item.name)),
        ) +
          28 +
          group.items[0].roles.length * COL_W,
      ),
    ),
  );
  const WIDTH = Math.ceil(contentWidth) + PAD * 2;

  const headerH = 130;
  const groupHeadH = 56;
  const height =
    headerH +
    groups.reduce(
      (sum, group) => sum + groupHeadH + group.items.length * ROW_H + 16,
      0,
    ) +
    PAD;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas is not supported in this browser.");
  }
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WIDTH, height);
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#24212b";
  ctx.font = `700 30px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText("kinkr results", PAD, PAD + 8);

  // Legend
  let legendX = PAD;
  ctx.font = `14px ${FONT}`;
  for (const option of ratingOptions) {
    drawCircle(ctx, legendX + 8, PAD + 62, option.color);
    ctx.fillStyle = "#24212b";
    ctx.textAlign = "left";
    ctx.fillText(option.label, legendX + 24, PAD + 62);
    legendX += 24 + ctx.measureText(option.label).width + 22;
  }

  let y = headerH;
  for (const group of groups) {
    const roles = group.items[0].roles;
    const rightEdge = WIDTH - PAD;

    ctx.fillStyle = "#7c234e";
    ctx.font = `700 20px ${FONT}`;
    ctx.textAlign = "left";
    ctx.fillText(group.category, PAD, y + 16);

    if (roles.length > 1) {
      ctx.fillStyle = "#6b6775";
      ctx.font = `600 13px ${FONT}`;
      ctx.textAlign = "center";
      roles.forEach((role, index) => {
        const cx = rightEdge - COL_W * (roles.length - index) + COL_W / 2;
        ctx.fillText(titleCase(role), cx, y + 40);
      });
    }
    ctx.strokeStyle = "#e3e1e8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD, y + groupHeadH - 6);
    ctx.lineTo(rightEdge, y + groupHeadH - 6);
    ctx.stroke();
    y += groupHeadH;

    for (const item of group.items) {
      const cy = y + ROW_H / 2;
      ctx.fillStyle = "#24212b";
      ctx.font = `15px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillText(item.name, PAD, cy);
      item.ratings.forEach((rating, index) => {
        const cx =
          rightEdge - COL_W * (roles.length - index) + COL_W / 2;
        drawCircle(ctx, cx, cy, colorOf(rating));
      });
      y += ROW_H;
    }
    y += 16;
  }

  return canvas;
}

export function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not create PNG."));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}
