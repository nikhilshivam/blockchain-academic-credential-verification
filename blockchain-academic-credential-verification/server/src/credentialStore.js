const crypto = require("crypto");

function canonicalize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function hashCredential(credential) {
  const canonical = canonicalize(credential);
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function makeCredentialId(hash) {
  return crypto
    .createHash("sha256")
    .update(`credential-id:${hash}`)
    .digest("hex");
}

module.exports = {
  canonicalize,
  hashCredential,
  makeCredentialId
};
