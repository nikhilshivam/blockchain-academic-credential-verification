import React, { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [form, setForm] = useState({studentName:"", university:"", degree:"", graduationYear:""});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function issueCertificate(e) {
    e.preventDefault(); setError(""); setResult(null);
    try {
      const r = await fetch(API + "/api/credentials/issue", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form)
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Issuing failed");
      setResult(data);
    } catch (err) { setError(err.message); }
  }

  return <main className="container">
    <h1>Blockchain Academic Credential Verification</h1>
    <p>Issue a certificate and automatically generate its Token ID and QR Code.</p>
    <section className="card">
      <h2>Issue Certificate</h2>
      <form onSubmit={issueCertificate}>
        {[
          ["studentName","Student Name"],["university","University"],
          ["degree","Degree"],["graduationYear","Graduation Year"]
        ].map(([key,label]) => <label key={key}>{label}
          <input required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}/>
        </label>)}
        <button>Issue Certificate</button>
      </form>
    </section>
    {error && <div className="error">{error}</div>}
    {result && <section className="card">
      <h2>Certificate Issued ✅</h2>
      <p><b>Token ID</b></p><code>{result.tokenId}</code>
      <p><b>SHA-256 Document Hash</b></p><code>{result.documentHash}</code>
      <p><b>Verification URL</b></p><a href={result.verificationUrl} target="_blank" rel="noreferrer">{result.verificationUrl}</a>
      <div className="qr"><img src={result.qrCodeDataUrl} alt="Certificate verification QR code"/><p>Scan this QR code to verify.</p></div>
      {result.transactionHash && <><p><b>Blockchain Transaction</b></p><code>{result.transactionHash}</code></>}
    </section>}
  </main>;
}