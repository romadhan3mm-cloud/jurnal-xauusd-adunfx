// Buat pasangan kunci VAPID baru. Jalankan: node scripts-generate-vapid.mjs
// Simpan hasilnya sebagai secret Worker. JANGAN commit private key.
import { generateKeyPairSync } from "node:crypto";
const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
const jwk = privateKey.export({ format: "jwk" });
const b = (s) => s;
const pub = Buffer.concat([Buffer.from([4]), Buffer.from(jwk.x, "base64url"), Buffer.from(jwk.y, "base64url")]).toString("base64url");
console.log("VAPID_PUBLIC_KEY=" + pub);
console.log("VAPID_PRIVATE_KEY=" + jwk.d);
console.log("VAPID_SUBJECT=mailto:emailkamu@domain.com");
