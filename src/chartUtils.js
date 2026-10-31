// Fungsi murni untuk grafik (tanpa React) agar mudah dites.

// Benar bila garis grid horizontal ini adalah garis paling bawah area grafik (berimpit dengan sumbu X).
// `p` = props yang diberikan recharts ke tiap garis grid: y/height = area grid, y1 = posisi garis.
export function isBottomGridLine(p, tolerance = 1) {
  const { y, height, y1 } = p || {};
  if (![y, height, y1].every(Number.isFinite)) return false;
  return Math.abs(y1 - (y + height)) < tolerance;
}
