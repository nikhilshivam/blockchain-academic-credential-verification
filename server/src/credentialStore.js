const crypto = require("crypto");

function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function hashCredential(credential) {
  return crypto.createHash("sha256").update(canonicalize(credential)).digest("hex");
}

function makeCredentialId(hash) {
  return crypto.createHash("sha256").update(`credential-id:${hash}`).digest("hex");
}

module.exports = { canonicalize, hashCredential, makeCredentialId };