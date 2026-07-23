import Link from "next/link";
import { getService360Blurb, SERVICE360_URL } from "./service360-content";

type Service360PoweredProps = {
  serviceSlug: string;
  serviceTitle: string;
};

export function Service360Powered({
  serviceSlug,
  serviceTitle,
}: Service360PoweredProps) {
  const blurb = getService360Blurb(serviceSlug);

  return (
    <section className="m1-section m1-section--stone">
      <div className="m1-wrap m1-s360-powered">
        <div className="m1-s360-powered__copy">
          <p className="m1-label">Powered by Service360</p>
          <h2 className="m1-h2">
            The app we built
            <br />
            <em>to deliver {serviceTitle.toLowerCase()}</em>
          </h2>
          <p className="m1-s360-powered__tagline">{blurb.tagline}</p>
          <p className="m1-s360-powered__text">{blurb.text}</p>
          <div className="m1-s360-powered__actions">
            <Link href="/service360" className="m1-btn m1-btn--ink">
              About Service360
            </Link>
            <a
              href={SERVICE360_URL}
              className="m1-btn m1-btn--line"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit platform
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
