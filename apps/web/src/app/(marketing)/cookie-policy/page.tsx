import { Metadata } from "next";
import Image from "next/image";
import { CornerCloud } from "@/components/marketing/CornerCloud";

export const metadata: Metadata = {
  title: "Cookie Policy — Dialogue Room",
  description: "How Dialogue Room uses cookies and tracking technologies",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="space-y-8">
        <div>
          <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          <CornerCloud corner="tr" />
            <Image
              src="/images/cookieData.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">Cookie Policy</h1>
          <p className="text-sm text-slate-400">Last updated: August 28, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">1. What Are Cookies?</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Cookies are small text files that are stored on your browser or device when you visit a website. They contain information about your browsing activity and preferences. Dialogue Room uses cookies to enhance your experience and improve our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">2. Cookies We Use</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Authentication Cookies</h3>
              <p className="text-base leading-relaxed text-slate-300">
                <strong>dr_access</strong> — Contains your access token for keeping you logged in. This is an httpOnly cookie, meaning it cannot be accessed by JavaScript (protecting against XSS attacks). It expires after 15 minutes.
              </p>
              <p className="text-base leading-relaxed text-slate-300">
                <strong>dr_refresh</strong> — Contains your refresh token to automatically extend your session. This is an httpOnly cookie that expires after 30 days.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Preference Cookies</h3>
              <p className="text-base leading-relaxed text-slate-300">
                <strong>theme preference</strong> — Stored in your browser's localStorage (not a traditional cookie), this remembers whether you prefer light or dark mode so we can display the interface in your preferred style.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">3. Cookie Purposes</h2>
          <ul className="space-y-2 text-base text-slate-300">
            <li>
              <strong>Authentication:</strong> To maintain your login session securely
            </li>
            <li>
              <strong>Security:</strong> To prevent unauthorized access and detect suspicious activity
            </li>
            <li>
              <strong>Personalization:</strong> To remember your preferences for a better experience
            </li>
            <li>
              <strong>Session Management:</strong> To ensure seamless navigation across the platform
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">4. Cookie Security</h2>
          <p className="text-base leading-relaxed text-slate-300">Our authentication cookies are:</p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-300">
            <li>
              <strong>httpOnly:</strong> Cannot be accessed by JavaScript, protecting against XSS attacks
            </li>
            <li>
              <strong>SameSite=Lax:</strong> Prevents CSRF attacks while allowing cross-site navigation
            </li>
            <li>
              <strong>Secure (in production):</strong> Only transmitted over HTTPS to prevent interception
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">5. Third-Party Cookies</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Dialogue Room does not use third-party cookies for tracking or advertising purposes. We do not partner with analytics services or ad networks that track your behavior across websites.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">6. Cookie Consent</h2>
          <p className="text-base leading-relaxed text-slate-300">
            By accepting our Terms of Service and Privacy Policy during signup, you consent to our use of cookies as described in this policy. Our cookies are essential for the platform to function — you cannot use Dialogue Room without accepting them.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">7. Managing Your Cookies</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Most web browsers allow you to control cookies through your browser settings. You can set your browser to refuse cookies or alert you when cookies are being sent. However, blocking essential cookies may prevent you from using Dialogue Room.
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            To manage your localStorage preferences (like theme), you can clear your browser's local storage data, though this will reset your preferences.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">8. Cookie Retention</h2>
          <p className="text-base leading-relaxed text-slate-300">
            <strong>Access Token (dr_access):</strong> 15 minutes from issuance
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            <strong>Refresh Token (dr_refresh):</strong> 30 days from issuance
          </p>
          <p className="text-base leading-relaxed text-slate-300">
            <strong>Theme Preference:</strong> Indefinitely (until you clear browser localStorage)
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">9. Updates to This Policy</h2>
          <p className="text-base leading-relaxed text-slate-300">
            We may update this Cookie Policy from time to time as our practices evolve. We will notify you by updating the "Last updated" date on this page. Your continued use of Dialogue Room after changes indicates your acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">10. Contact Us</h2>
          <p className="text-base leading-relaxed text-slate-300">
            If you have questions about our use of cookies or this Cookie Policy, please contact us at{" "}
            <a
              href="mailto:support@dialogueroom.com"
              className="rounded font-semibold text-amber-400 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950"
            >
              support@dialogueroom.com
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
