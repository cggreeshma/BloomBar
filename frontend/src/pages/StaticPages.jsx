import { Link } from "react-router-dom";

export function Occasions() {
  const items = ["Birthday", "Anniversary", "Romance", "Thank You", "Wedding", "Sympathy", "Congratulations"];
  return (
    <div>
      <h1 className="display text-5xl">Occasions</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((o) => (
          <Link key={o} to={`/shop?occasion=${encodeURIComponent(o)}`} className="card p-8">
            <p className="display text-4xl">{o}</p>
            <p className="mt-2 text-sm text-ink/50">Shop the edit</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function About() {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className="display text-6xl">About the atelier</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink/70">
        BloomBar is a small flower house in Bengaluru. We buy stems as if we were arranging for our own table: honest colour, quiet wrapping, no foam mountains.
        The customisation studio exists because a bouquet should be able to hold a specific person — not a generic occasion.
      </p>
    </article>
  );
}

export function Contact() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="display text-5xl">Contact</h1>
        <p className="mt-4 text-ink/65">Indiranagar atelier · Bengaluru</p>
        <p>hello@bloombar.atelier</p>
        <p>+91 80 4000 1212</p>
        <p className="mt-4 text-sm">Instagram · Pinterest · WhatsApp</p>
      </div>
      <form className="card space-y-3 p-6" onSubmit={(e) => e.preventDefault()}>
        <input placeholder="Name" />
        <input placeholder="Email" />
        <textarea rows={4} placeholder="Message" />
        <button className="btn-dark">Send</button>
      </form>
    </div>
  );
}

export function Care() {
  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <h1 className="display text-5xl">Flower care</h1>
      <p>Recut stems on the diagonal. Change water daily. Keep away from fruit, heaters and midday windows. Mist petals in dry rooms.</p>
      <p>Roses like cool rooms. Tulips continue to grow in the vase — give them space. Lilies last longer if you pinch pollen. Sunflowers drink deeply.</p>
    </article>
  );
}

export function Policies() {
  return (
    <article className="mx-auto max-w-2xl space-y-4">
      <h1 className="display text-5xl">Policies</h1>
      <p>Same-day delivery in select Bengaluru pin codes when ordered before 2pm. Express slots subject to florist capacity.</p>
      <p>Perishable flowers cannot be returned once delivered in good condition. Damaged stems are replaced or refunded within 12 hours of a photograph.</p>
      <p>We store only what we need to fulfil orders. Passwords are hashed. Payment cards are processed by Razorpay and never stored on BloomBar servers.</p>
    </article>
  );
}
