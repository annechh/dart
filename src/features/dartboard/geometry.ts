export function position(radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return [250 + radius * Math.sin(radians), 250 - radius * Math.cos(radians)];
}
export function segment(inner: number, outer: number, angle: number) {
  const a = position(outer, angle - 9),
    b = position(outer, angle + 9);
  const c = position(inner, angle + 9),
    d = position(inner, angle - 9);
  return `M ${a} A ${outer} ${outer} 0 0 1 ${b} L ${c} A ${inner} ${inner} 0 0 0 ${d} Z`;
}
