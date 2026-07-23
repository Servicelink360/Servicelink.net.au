import { SiteFooter } from "./SiteFooter";
import { SiteNav } from "./SiteNav";
import { JoinForm } from "./JoinForm";

export default function JoinPage() {
  return (
    <>
      <SiteNav />
      <section className="m1-section">
        <JoinForm />
      </section>
      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
