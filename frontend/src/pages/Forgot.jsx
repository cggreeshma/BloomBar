import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [token, setToken] = useState("");

  return (
    <div className="mx-auto max-w-md card p-8">
      <h1 className="display text-4xl">Reset password</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const { data } = await api.post("/auth/forgot", { email });
          setMsg(data.message);
          setToken(data.devToken || "");
        }}
      >
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <button className="btn-dark w-full">Send link</button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
      {token && (
        <p className="mt-2 text-sm">
          Dev reset: <Link className="underline" to={`/reset-password/${token}`}>open reset page</Link>
        </p>
      )}
    </div>
  );
}
