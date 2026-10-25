import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// Baca package.json manual (lebih aman lintas versi Node, dibanding import assertion)
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url)));

export default defineConfig({
  plugins: [react()],
  define: {
    // Angka versi diambil otomatis dari package.json saat build,
    // supaya cuma perlu diubah di satu tempat (package.json) tiap rilis baru.
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
