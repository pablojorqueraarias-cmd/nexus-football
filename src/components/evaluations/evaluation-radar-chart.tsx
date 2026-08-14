interface RadarItem {
  label: string;
  level: number;
}

function pointColor(level: number) {
  if (level >= 4) return "#16a34a";
  if (level === 3) return "var(--color-brand-600)";
  return "#d97706";
}

export function EvaluationRadarChart({ items, size = 220 }: { items: RadarItem[]; size?: number }) {
  const n = items.length;
  if (n < 3) return null;

  const center = size / 2;
  const radius = size * 0.36;
  const labelRadius = radius + 14;

  function pointAt(index: number, value: number) {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / n;
    return {
      x: center + radius * value * Math.cos(angle),
      y: center + radius * value * Math.sin(angle),
    };
  }

  const dataPoints = items.map((item, i) => pointAt(i, item.level / 5));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");
  const outerPoints = items.map((_, i) => pointAt(i, 1));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {/* anillos guía: uno por cada nivel 1-5 */}
      {[0.2, 0.4, 0.6, 0.8, 1].map((r) => (
        <polygon
          key={r}
          points={items.map((_, i) => { const p = pointAt(i, r); return `${p.x},${p.y}`; }).join(" ")}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth={1}
        />
      ))}

      {/* radios */}
      {outerPoints.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e4e4e7" strokeWidth={1} />
      ))}

      {/* área de resultados */}
      <polygon points={dataPath} fill="var(--color-brand-500)" fillOpacity={0.25} stroke="var(--color-brand-600)" strokeWidth={2} />

      {/* puntos por criterio */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={pointColor(items[i].level)} />
      ))}

      {/* números de eje */}
      {items.map((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize={10}
            fill="#71717a"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {i + 1}
          </text>
        );
      })}
    </svg>
  );
}
