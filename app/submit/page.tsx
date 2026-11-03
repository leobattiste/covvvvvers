import type { Metadata } from "next";
import SubmitForm from "./SubmitForm";

export const metadata: Metadata = {
  title: "Request a cover",
  description: "Request a rap album cover to be added to the archive. No account required.",
};

export default function RequestPage() {
  return (
    <section className="panel">
      <h1>Request a cover</h1>
      <p>Missing an album cover? Tell us what you would like to see in the archive. No account required. Requests are reviewed before anything is added.</p>
      <SubmitForm />
    </section>
  );
}
