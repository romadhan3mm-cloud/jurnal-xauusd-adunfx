import test from "node:test";
import assert from "node:assert/strict";
import { isBottomGridLine } from "../src/chartUtils.js";

// Area grid: y=10, height=200 -> garis paling bawah di y1=210
const area = { y: 10, height: 200 };

test("isBottomGridLine: garis paling bawah dikenali", () => {
  assert.equal(isBottomGridLine({ ...area, y1: 210 }), true);
  assert.equal(isBottomGridLine({ ...area, y1: 209.5 }), true); // toleransi pembulatan
});

test("isBottomGridLine: garis lain tidak dianggap paling bawah", () => {
  assert.equal(isBottomGridLine({ ...area, y1: 10 }), false); // garis paling atas
  assert.equal(isBottomGridLine({ ...area, y1: 160 }), false);
  assert.equal(isBottomGridLine({ ...area, y1: 208 }), false);
});

test("isBottomGridLine: data tidak lengkap aman (garis tetap digambar)", () => {
  assert.equal(isBottomGridLine(undefined), false);
  assert.equal(isBottomGridLine({}), false);
  assert.equal(isBottomGridLine({ y1: 210 }), false);
  assert.equal(isBottomGridLine({ y: null, height: 200, y1: 210 }), false);
});
