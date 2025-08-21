export default function Landing() {
  const title = process.env.NEXT_PUBLIC_SITE_NAME ?? "AI and AX Design Conference";
  const dates = process.env.NEXT_PUBLIC_EVENT_DATES ?? "June 24–25, 2005";
  const subtitle = process.env.NEXT_PUBLIC_EVENT_SUBTITLE ?? "Sponsored by the International Conference on Axiomatic Design";
  return (
    <div className="container">
      <h1 className="h1">{title}</h1>
      <p className="h2">{subtitle}</p>
      <p>Dates: <strong>{dates}</strong></p>
      <p>
        This site manages two flows: (1) non-binding interest registration and (2) full paid registration ($500).
      </p>
      <div style={{display:'grid', gap:12, gridTemplateColumns:'1fr 1fr', marginTop:16}}>
        <a href="/register-interest"><button>Register Interest</button></a>
        <a href="/register"><button>Paid Registration ($500)</button></a>
      </div>
    </div>
  );
}
