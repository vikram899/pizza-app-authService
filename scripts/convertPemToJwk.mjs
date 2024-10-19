import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const pem = fs.readFileSync("certs/public.pem");

const jwk = rsaPemToJwk(pem, { use: "sig" }, "public");

// eslint-disable-next-line no-undef, no-console
console.log(JSON.stringify(jwk));
