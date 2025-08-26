import Link from "next/link";
export default function ThankYou() {
  return (
    <div className="container">
      <h1 className="h1">Thank you</h1>
      <p>Your registration is being processed. A receipt will be sent by email.</p>
      <Link href="/"><button>Back to Home</button></Link>
    </div>
  );
}
