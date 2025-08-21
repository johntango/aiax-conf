export default function Cancel() {
  return (
    <div className="container">
      <h1 className="h1">Payment Cancelled</h1>
      <p>No payment has been taken. You may try again at any time.</p>
      <a href="/register"><button>Return to Registration</button></a>
    </div>
  );
}
