import Link from "next/link";
export default function Success() {
  return (
    <div className="container">
      <h1 className="h1">Registration Confirmed</h1>
      <p>Payment confirmed. We look forward to seeing you at the conference.</p>
      <Link href="/"><button>Back to Home</button></Link>
    </div>
  );
}
