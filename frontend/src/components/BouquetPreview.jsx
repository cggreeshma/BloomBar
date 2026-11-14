const wrapColors = {
  kraft: "#c4a574",
  pastel: "#f3d6d8",
  transparent: "#e8e4dc",
  luxury: "#1f2a24",
  newspaper: "#d9d2c5",
};

export default function BouquetPreview({ flowers = [], wrapping, ribbon, size = "medium" }) {
  const scale = { small: 0.82, medium: 1, large: 1.12, premium: 1.22 }[size] || 1;
  const wrap = wrapping?.slug || wrapping?.name?.toLowerCase?.() || "pastel";
  const wrapColor = wrapping?.color || wrapColors[wrap] || "#f3d6d8";
  const ribbonColor = ribbon?.color || "#c97b84";

  return (
    <div className="relative mx-auto grid h-[420px] w-full place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-b from-blush-50 to-cream-100">
      <div className="absolute inset-x-10 bottom-8 h-24 rounded-[50%] opacity-40" style={{ background: wrapColor }} />
      <div className="relative" style={{ transform: `scale(${scale})` }}>
        {flowers.filter((f) => f.quantity > 0).map((f, i) => (
          <img
            key={f.flower || f.slug || i}
            src={f.image}
            alt={f.name}
            className="absolute h-28 w-28 rounded-full object-cover shadow-soft ring-4 ring-white/40"
            style={{
              left: `${Math.cos((i / Math.max(flowers.length, 1)) * Math.PI * 2) * 70}px`,
              top: `${Math.sin((i / Math.max(flowers.length, 1)) * Math.PI * 2) * 54 - 20}px`,
              zIndex: i,
            }}
          />
        ))}
        <div
          className="relative mx-auto mt-28 h-40 w-28 rounded-b-[2.5rem] rounded-t-3xl shadow-soft"
          style={{ background: `linear-gradient(180deg, ${wrapColor}, #efe4d4)` }}
        />
        <div className="absolute bottom-16 left-1/2 h-3 w-24 -translate-x-1/2 rounded-full" style={{ background: ribbonColor }} />
      </div>
      {!flowers.some((f) => f.quantity > 0) && (
        <p className="absolute text-sm text-ink/40">Select stems to compose your bouquet</p>
      )}
    </div>
  );
}
