import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

export default function Reset() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md card p-8">
      <h1 className="display text-4xl">New password</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const { data } = await api.post(`/auth/reset/${token}`, { password });
          setMsg(data.message);
          setTimeout(() => navigate("/login"), 800);
        }}
      >
        <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-dark w-full">Update</button>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </div>
  );
}
