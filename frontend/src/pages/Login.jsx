import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function Login() {
  const { login, persist } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = params.get("next") || "/account";

  return (
    <div className="mx-auto max-w-md card p-8">
      <h1 className="display text-5xl">Welcome back</h1>
      <p className="mt-2 text-sm text-ink/50">Demo: demo@bloombar.com / Demo@123 · Admin: admin@bloombar.com / Admin@123</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await login(form);
            navigate(next);
          } catch (ex) {
            setErr(ex.response?.data?.message || "Unable to sign in");
          }
        }}
      >
        <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" required placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {err && <p className="text-sm text-blush-600">{err}</p>}
        <button className="btn-dark w-full">Sign in</button>
      </form>
      <button
        className="btn-line mt-3 w-full"
        onClick={async () => {
          const email = prompt("Google email for demo OAuth");
          if (!email) return;
          const { data } = await api.post("/auth/google", { email, name: email.split("@")[0], googleId: `demo-${email}` });
          persist(data.token, data.user);
          navigate(next);
        }}
      >
        Continue with Google (demo)
      </button>
      <div className="mt-4 flex justify-between text-sm">
        <Link to="/register">Create account</Link>
        <Link to="/forgot">Forgot password</Link>
      </div>
    </div>
  );
}
