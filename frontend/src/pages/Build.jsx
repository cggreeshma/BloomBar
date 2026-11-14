import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { formatINR } from "../api/client";
import BouquetPreview from "../components/BouquetPreview";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const STEPS = ["Flowers", "Size", "Colour", "Wrapping", "Ribbon", "Notes", "Gifts", "Review"];
const THEMES = ["pink", "red", "white", "purple", "yellow", "pastel mix", "custom"];
const SIZES = [
  ["small", "Small posy"],
  ["medium", "Medium gathered"],
  ["large", "Large armful"],
  ["premium", "Premium atelier"],
];

export default function Build() {
  const [studio, setStudio] = useState(null);
  const [step, setStep] = useState(0);
  const [flowers, setFlowers] = useState({});
  const [size, setSize] = useState("medium");
  const [colorTheme, setColorTheme] = useState("pastel mix");
  const [customColors, setCustomColors] = useState("");
  const [wrapping, setWrapping] = useState(null);
  const [ribbon, setRibbon] = useState(null);
  const [ribbonColor, setRibbonColor] = useState("blush");
  const [touches, setTouches] = useState({ messageCard: "", printedName: "", tag: "", note: "", photoUrl: "" });
  const [addOns, setAddOns] = useState([]);
  const [total, setTotal] = useState(0);
  const [previewCard, setPreviewCard] = useState(false);
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/custom/studio").then((r) => {
      setStudio(r.data);
      setWrapping(r.data.wrappings[1] || r.data.wrappings[0]);
      setRibbon(r.data.ribbons[0]);
    });
  }, []);

  const selectedFlowers = useMemo(() => {
    if (!studio) return [];
    return studio.flowers
      .map((f) => ({ ...f, quantity: flowers[f._id] || 0, unitPrice: f.price, flower: f._id }))
      .filter((f) => f.quantity > 0);
  }, [studio, flowers]);

  const payload = () => ({
    name: "Atelier custom",
    flowers: selectedFlowers.map((f) => ({
      flower: f._id,
      name: f.name,
      image: f.image,
      quantity: f.quantity,
      unitPrice: f.price,
      color: f.colors?.[0],
    })),
    size,
    colorTheme: colorTheme === "custom" ? customColors : colorTheme,
    wrapping: wrapping ? { option: wrapping._id, name: wrapping.name, color: wrapping.color } : {},
    ribbon: ribbon ? { option: ribbon._id, name: ribbon.name, color: ribbonColor } : {},
    personalTouches: touches,
    addOns: addOns.map((a) => ({ addOn: a._id, name: a.name, price: a.price, image: a.image })),
  });

  useEffect(() => {
    if (!studio) return;
    api.post("/custom/preview-price", payload()).then((r) => setTotal(r.data.total));
  }, [selectedFlowers, size, wrapping, ribbon, addOns]);

  if (!studio) return <p className="py-20 text-center">Opening the studio…</p>;

  const saveBouquet = async (saved = false) => {
    if (!selectedFlowers.length) return alert("Choose at least one stem.");
    const { data } = await api.post("/custom", { ...payload(), saved, user: user?._id });
    return data;
  };

  const toCart = async (buy) => {
    if (!user) return navigate("/login?next=/build");
    const data = await saveBouquet(true);
    await add({ kind: "custom", customBouquetId: data._id, quantity: 1 });
    navigate(buy ? "/checkout" : "/cart");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-ink/40">Signature studio</p>
        <h1 className="display text-5xl md:text-6xl">Build your bouquet</h1>
        <div className="mt-6 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`rounded-full px-3 py-1 text-xs ${i === step ? "bg-ink text-cream-50" : "bg-white ring-1 ring-blush-200"}`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        <div className="card mt-6 p-6">
          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {studio.flowers.map((f) => (
                <div key={f._id} className="flex gap-3 rounded-2xl bg-cream-50 p-3">
                  <img src={f.image} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{f.name}</p>
                    <p className="text-sm text-ink/50">{formatINR(f.price)} / stem</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="h-8 w-8 rounded-full bg-white" onClick={() => setFlowers((p) => ({ ...p, [f._id]: Math.max(0, (p[f._id] || 0) - 1) }))}>
                        −
                      </button>
                      <span>{flowers[f._id] || 0}</span>
                      <button className="h-8 w-8 rounded-full bg-white" onClick={() => setFlowers((p) => ({ ...p, [f._id]: (p[f._id] || 0) + 1 }))}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {SIZES.map(([id, label]) => (
                <button key={id} onClick={() => setSize(id)} className={`rounded-2xl p-5 text-left ring-1 ${size === id ? "bg-ink text-white" : "bg-cream-50 ring-blush-200"}`}>
                  <p className="display text-3xl">{label}</p>
                  <p className="text-sm opacity-70">Scale {studio.sizes[id]}×</p>
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button key={t} onClick={() => setColorTheme(t)} className={`rounded-full px-4 py-2 capitalize ${colorTheme === t ? "bg-ink text-white" : "bg-cream-50"}`}>
                    {t}
                  </button>
                ))}
              </div>
              {colorTheme === "custom" && (
                <input className="mt-4" placeholder="Describe your mix" value={customColors} onChange={(e) => setCustomColors(e.target.value)} />
              )}
            </div>
          )}
          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {studio.wrappings.map((w) => (
                <button key={w._id} onClick={() => setWrapping(w)} className={`overflow-hidden rounded-2xl text-left ring-2 ${wrapping?._id === w._id ? "ring-ink" : "ring-transparent"}`}>
                  <img src={w.image} alt="" className="h-28 w-full object-cover" />
                  <p className="p-3">
                    {w.name} · {formatINR(w.price)}
                  </p>
                </button>
              ))}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              {studio.ribbons.map((r) => (
                <button key={r._id} onClick={() => setRibbon(r)} className={`flex w-full items-center justify-between rounded-2xl p-4 ${ribbon?._id === r._id ? "bg-ink text-white" : "bg-cream-50"}`}>
                  <span>{r.name}</span>
                  <span>{formatINR(r.price)}</span>
                </button>
              ))}
              <div className="flex flex-wrap gap-2">
                {(ribbon?.colors || ["blush"]).map((c) => (
                  <button key={c} onClick={() => setRibbonColor(c)} className={`rounded-full px-3 py-1 capitalize ${ribbonColor === c ? "bg-blush-400 text-white" : "bg-white"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-3">
              <input placeholder="Message card" value={touches.messageCard} onChange={(e) => setTouches({ ...touches, messageCard: e.target.value })} />
              <input placeholder="Printed name" value={touches.printedName} onChange={(e) => setTouches({ ...touches, printedName: e.target.value })} />
              <select value={touches.tag} onChange={(e) => setTouches({ ...touches, tag: e.target.value })}>
                <option value="">Occasion tag</option>
                <option>Birthday</option>
                <option>Anniversary</option>
                <option>Thank you</option>
              </select>
              <textarea rows={3} placeholder="Small note" value={touches.note} onChange={(e) => setTouches({ ...touches, note: e.target.value })} />
              <input placeholder="Photograph URL (optional)" value={touches.photoUrl} onChange={(e) => setTouches({ ...touches, photoUrl: e.target.value })} />
              <button type="button" className="btn-line" onClick={() => setPreviewCard(true)}>
                Digital gift preview
              </button>
            </div>
          )}
          {step === 6 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {studio.addOns.map((a) => {
                const on = addOns.some((x) => x._id === a._id);
                return (
                  <button
                    key={a._id}
                    onClick={() => setAddOns((list) => (on ? list.filter((x) => x._id !== a._id) : [...list, a]))}
                    className={`overflow-hidden rounded-2xl text-left ring-2 ${on ? "ring-ink" : "ring-transparent"}`}
                  >
                    <img src={a.image} alt="" className="h-28 w-full object-cover" />
                    <p className="p-3">
                      {a.name} · {formatINR(a.price)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
          {step === 7 && (
            <div className="space-y-2 text-sm">
              <p>
                <strong>Stems:</strong> {selectedFlowers.map((f) => `${f.quantity}× ${f.name}`).join(", ") || "—"}
              </p>
              <p>
                <strong>Size / colour:</strong> {size} · {colorTheme === "custom" ? customColors : colorTheme}
              </p>
              <p>
                <strong>Wrap / ribbon:</strong> {wrapping?.name} · {ribbon?.name} ({ribbonColor})
              </p>
              <p>
                <strong>Card:</strong> {touches.messageCard || "none"}
              </p>
              <p>
                <strong>Gifts:</strong> {addOns.map((a) => a.name).join(", ") || "none"}
              </p>
              <p className="display text-4xl">{formatINR(total)}</p>
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <button className="btn-line" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
            {step < 7 ? (
              <button className="btn-dark" onClick={() => setStep((s) => s + 1)}>
                Continue
              </button>
            ) : (
              <div className="flex gap-2">
                <button className="btn-line" onClick={() => saveBouquet(true).then((d) => navigate(`/share/${d.shareId}`))}>
                  Save & share
                </button>
                <button className="btn-line" onClick={() => toCart(false)}>
                  Add to cart
                </button>
                <button className="btn-dark" onClick={() => toCart(true)}>
                  Buy now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24">
        <BouquetPreview flowers={selectedFlowers} wrapping={wrapping} ribbon={{ ...ribbon, color: ribbonColor }} size={size} />
        <div className="card p-5">
          <p className="text-xs uppercase tracking-widest text-ink/40">Live total</p>
          <p className="display text-5xl">{formatINR(total)}</p>
          <p className="text-sm text-ink/50">{selectedFlowers.reduce((s, f) => s + f.quantity, 0)} stems</p>
        </div>
      </aside>
      {previewCard && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4" onClick={() => setPreviewCard(false)}>
          <div className="card max-w-md p-10 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs uppercase tracking-[0.3em]">BloomBar</p>
            <p className="display mt-4 text-4xl">{touches.printedName || "Dearest"}</p>
            <p className="mt-6 italic text-ink/70">{touches.messageCard || "A small garden, sent with care."}</p>
            <p className="mt-8 text-sm">{touches.tag}</p>
          </div>
        </div>
      )}
    </div>
  );
}
