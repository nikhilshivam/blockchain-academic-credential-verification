import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const sample = {
  studentName: "Alex Morgan",
  university: "Example University",
  degree: "B.Tech Computer Science",
  graduationYear: 2026,
  honors: "First Class",
};

export default function App() {
  const [credential, setCredential] = useState(
    JSON.stringify(sample, null, 2)
  );
  const [issueResult, setIssueResult] = useState(null);
  const [verifyId, setVerifyId] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function issueCredential() {
    setLoading(true);
    setError("");
    setIssueResult(null);

    try {
      const payload = JSON.parse(credential);

      const response = await fetch(`${API}/credentials/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Issue failed");

      setIssueResult(data);
      setVerifyId(data.credentialId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyCredential() {
    setLoading(true);
    setError("");
    setVerifyResult(null);

    try {
      if (!verifyId.trim()) throw new Error("Enter a credential ID");

      const response = await fetch(
        `${API}/credentials/verify/${encodeURIComponent(verifyId.trim())}`
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Verification failed");

      setVerifyResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">BLOCKCHAIN • EDUCATION • TRUST</p>
        <h1>CredentialVerify</h1>
        <p className="subtitle">
          Issue tamper-evident academic credentials and verify them in seconds.
        </p>
      </section>

      {error && <div className="alert error">{error}</div>}

      <section className="grid">
        <article className="card">
          <div className="card-heading">
            <span className="number">01</span>
            <div>
              <h2>Issue Credential</h2>
              <p>University/admin workflow</p>
            </div>
          </div>

          <textarea
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            spellCheck="false"
          />

          <button onClick={issueCredential} disabled={loading}>
            {loading ? "Processing..." : "Issue on Blockchain"}
          </button>

          {issueResult && (
            <div className="result">
              <strong>Credential issued</strong>
              <code>{issueResult.credentialId}</code>
              <small>Transaction: {issueResult.transactionHash}</small>
            </div>
          )}
        </article>

        <article className="card">
          <div className="card-heading">
            <span className="number">02</span>
            <div>
              <h2>Verify Credential</h2>
              <p>Employer/public verification</p>
            </div>
          </div>

          <input
            value={verifyId}
            onChange={(e) => setVerifyId(e.target.value)}
            placeholder="Enter credential ID"
          />

          <button onClick={verifyCredential} disabled={loading}>
            {loading ? "Checking..." : "Verify Credential"}
          </button>

          {verifyResult && (
            <div className={`result ${verifyResult.valid ? "valid" : "invalid"}`}>
              <strong>
                {verifyResult.valid ? "✓ Credential is valid" : "✕ Credential is not valid"}
              </strong>
              <p>Exists: {String(verifyResult.exists)}</p>
              <p>Revoked: {String(verifyResult.revoked)}</p>
              <p>Issuer: {verifyResult.issuer}</p>
              <code>{verifyResult.documentHash}</code>
            </div>
          )}
        </article>
      </section>

      <footer>
        Educational prototype • Do not store sensitive student information directly on-chain.
      </footer>
    </main>
  );
}
