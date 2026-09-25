import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

function IssuePage() {
  const [form, setForm] = useState({
    studentName: "",
    university: "",
    degree: "",
    graduationYear: ""
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function issueCertificate(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    try {
      const r = await fetch(API + "/api/credentials/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Issuing failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="container">
      <h1>Blockchain Academic Credential Verification</h1>
      <p>Issue a certificate and automatically generate its Token ID and QR Code.</p>

      <section className="card">
        <h2>Issue Certificate</h2>
        <form onSubmit={issueCertificate}>
          {[
            ["studentName", "Student Name"],
            ["university", "University"],
            ["degree", "Degree"],
            ["graduationYear", "Graduation Year"]
          ].map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                required
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <button>Issue Certificate</button>
        </form>
      </section>

      {error && <div className="error">{error}</div>}

      {result && (
        <section className="card">
          <h2>Certificate Issued ✅</h2>
          <p><b>Token ID</b></p>
          <code>{result.tokenId}</code>

          <p><b>SHA-256 Document Hash</b></p>
          <code>{result.documentHash}</code>

          <p><b>Verification URL</b></p>
          <a href={result.verificationUrl} target="_blank" rel="noreferrer">
            {result.verificationUrl}
          </a>

          <div className="qr">
            <img src={result.qrCodeDataUrl} alt="Certificate verification QR code" />
            <p>Scan this QR code to verify the certificate.</p>
          </div>

          {result.transactionHash && (
            <>
              <p><b>Blockchain Transaction</b></p>
              <code>{result.transactionHash}</code>
            </>
          )}
        </section>
      )}
    </main>
  );
}

function VerifyPage({ tokenId }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        const r = await fetch(
          API + "/api/credentials/verify/" + encodeURIComponent(tokenId)
        );
        const result = await r.json();
        if (!r.ok) throw new Error(result.error || "Verification failed");
        setData(result);
      } catch (err) {
        setError(err.message);
      }
    }

    verify();
  }, [tokenId]);

  return (
    <main className="container">
      <section className="card verification-card">
        <h1>Certificate Verification</h1>
        <p><b>Token ID</b></p>
        <code>{tokenId}</code>

        {!data && !error && <p>Checking the blockchain...</p>}

        {error && <div className="error">{error}</div>}

        {data && !data.exists && (
          <div className="status invalid">
            <h2>❌ Certificate Not Found</h2>
            <p>This Token ID does not exist in the blockchain registry.</p>
          </div>
        )}

        {data && data.exists && !data.revoked && (
          <div className="status valid">
            <h2>✅ Certificate Valid</h2>
            <p>This credential exists on the blockchain and has not been revoked.</p>
            <p><b>Issuer:</b> {data.issuer}</p>
            <p><b>Issued:</b> {new Date(data.issuedAt * 1000).toLocaleString()}</p>
            <p><b>Document Hash:</b></p>
            <code>{data.documentHash}</code>
          </div>
        )}

        {data && data.exists && data.revoked && (
          <div className="status invalid">
            <h2>⚠️ Certificate Revoked</h2>
            <p>This credential exists but has been revoked by its original issuer.</p>
            <p><b>Issuer:</b> {data.issuer}</p>
            <p><b>Document Hash:</b></p>
            <code>{data.documentHash}</code>
          </div>
        )}

        <a className="back-link" href="/">← Issue another certificate</a>
      </section>
    </main>
  );
}

export default function App() {
  const match = window.location.pathname.match(/^\/verify\/([^/]+)\/?$/);

  if (match) {
    return <VerifyPage tokenId={decodeURIComponent(match[1])} />;
  }

  return <IssuePage />;
}
