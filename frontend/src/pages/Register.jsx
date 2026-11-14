import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md card p-8">
      <h1 className="display text-5xl">Join BloomBar</h1>
      <form
        className="mt-6 space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await register(form);
            navigate("/account");
          } catch (ex) {
            setErr(ex.response?.data?.message || "Unable to register");
          }
        }}
      >
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input type="password" required minLength={6} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {err && <p className="text-sm text-blush-600">{err}</p>}
        <button className="btn-dark w-full">Create account</button>
      </form>
      <Link to="/login" className="mt-4 inline-block text-sm">
        Already have an account
      </Link>
    </div>
  );
}
