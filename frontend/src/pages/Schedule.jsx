import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Schedule() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: "", occasion: "Birthday", date: "", recurring: true, reminder: true, notes: "" });

  const load = () => api.get("/user/schedule").then((r) => setList(r.data));
  useEffect(() => {
    if (user) load();
  }, [user]);

  if (!user) return <Link to="/login?next=/schedule">Sign in to schedule gifts</Link>;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form
        className="card space-y-3 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await api.post("/user/schedule", form);
          load();
        }}
      >
        <h1 className="display text-4xl">Gift scheduler</h1>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <select value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })}>
          {["Birthday", "Anniversary", "Mother's Day", "Just Because"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} /> Recurring reminder
        </label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" />
        <button className="btn-dark">Save date</button>
      </form>
      <div className="space-y-3">
        {list.map((i) => (
          <article key={i._id} className="card p-5">
            <p className="font-medium">{i.title || i.occasion}</p>
            <p className="text-sm text-ink/55">{i.date?.slice(0, 10)} {i.recurring && "· yearly"}</p>
            <button className="text-sm text-blush-600" onClick={() => api.delete(`/user/schedule/${i._id}`).then(load)}>
              Remove
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
