"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

type FormState = "idle" | "submitting" | "success" | "error";

export default function JoinPage() {
  const [state, setState] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setFeedback("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
          subscribeToUpdates: formData.get("updates") === "on",
          source: "join-page",
        }),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create your account.");
      }

      form.reset();
      setState("success");
      setFeedback(payload.message ?? "Your account has been created.");
    } catch (error) {
      setState("error");
      setFeedback(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <>
      <SiteNav />

      <section className="m1-section">
        <div className="m1-wrap m1-join">
          <div className="m1-join__intro">
            <p className="m1-label">Join Servicelink</p>
            <h1 className="m1-h1">Create your account</h1>
            <p className="m1-join__lead">
              Register to receive news and updates about our facilities services,
              and stay connected with the Servicelink team.
            </p>
            <p className="m1-join__meta">
              Already have an account?{" "}
              <Link href="/contact" className="m1-join__link">
                Contact us
              </Link>{" "}
              or browse{" "}
              <Link href="/news" className="m1-join__link">
                latest news
              </Link>
              .
            </p>
          </div>

          <form className="m1-join__form" onSubmit={handleSubmit}>
            <label className="m1-join__field">
              <span>Full name</span>
              <input required type="text" name="name" autoComplete="name" />
            </label>
            <label className="m1-join__field">
              <span>Email</span>
              <input required type="email" name="email" autoComplete="email" />
            </label>
            <label className="m1-join__field">
              <span>Password</span>
              <input
                required
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
              />
            </label>
            <label className="m1-join__checkbox">
              <input type="checkbox" name="updates" defaultChecked />
              <span>Email me Servicelink news and updates</span>
            </label>
            <button
              type="submit"
              disabled={state === "submitting"}
              className="m1-btn m1-btn--ink m1-btn--lg"
            >
              {state === "submitting" ? "Creating account..." : "Create account"}
            </button>
            {feedback ? (
              <p
                role="status"
                className={`m1-join__feedback ${
                  state === "error" ? "m1-join__feedback--error" : ""
                }`}
              >
                {feedback}
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <div className="sl-page m1-bottom">
        <SiteFooter />
      </div>
    </>
  );
}
