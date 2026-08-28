import { Metadata } from "next";
import Image from "next/image";
import { CornerCloud } from "@/components/marketing/CornerCloud";

export const metadata: Metadata = {
  title: "Privacy Policy — Dialogue Room",
  description: "How we protect and handle your data on Dialogue Room",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="space-y-8">
        <div>
          <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          <CornerCloud corner="tr" />
            <Image
              src="/images/privacyPolicy.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="text-sm text-slate-400">Last updated: August 28, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">1. Introduction</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Dialogue Room ("we", "us", "our") operates the language exchange platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">2. Information We Collect</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-slate-100">Account Information</h3>
              <p className="text-base leading-relaxed text-slate-300">
                When you sign up, we collect your name, email address, password, and preferred languages. You may optionally provide your birthdate, country, gender, and a profile photo.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Profile Data</h3>
              <p className="text-base leading-relaxed text-slate-300">
                Your profile includes your bio, fluent and learning languages, country, gender, and profile picture. This data is visible to other users when they view your profile.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Messages</h3>
              <p className="text-base leading-relaxed text-slate-300">
                All messages you send through Dialogue Room are stored on our servers. We retain conversation history to provide you with access to past discussions with your language learners.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Technical Data</h3>
              <p className="text-base leading-relaxed text-slate-300">
                We log your IP address, browser type, operating system, and pages visited. We use this information to improve platform stability and security.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">3. Cookies</h2>
          <p className="text-base leading-relaxed text-slate-300">
            We use cookies to keep you logged in and to remember your preferences:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-300">
            <li>
              <strong>dr_access</strong> — httpOnly cookie containing your access token (15-minute expiry)
            </li>
            <li>
              <strong>dr_refresh</strong> — httpOnly cookie for refreshing your session (30-day expiry)
            </li>
            <li>
              <strong>theme preference</strong> — stored in localStorage to remember your light/dark mode choice
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">4. How We Use Your Information</h2>
          <ul className="space-y-2 text-base text-slate-300">
            <li>To create and maintain your account</li>
            <li>To enable real-time messaging with your language learners</li>
            <li>To match you with compatible language learners based on your preferences</li>
            <li>To send you important service announcements and updates</li>
            <li>To investigate and prevent fraudulent or abusive activity</li>
            <li>To improve platform features and user experience</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">5. Information Sharing</h2>
          <p className="text-base leading-relaxed text-slate-300">
            We do not sell or trade your personal information to third parties. Your profile information is shared only with other users as part of the normal platform experience (discovery, messages, friendships). We may share information with service providers who assist us in operating the platform, all bound by confidentiality.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">6. Data Security</h2>
          <p className="text-base leading-relaxed text-slate-300">
            We implement industry-standard security measures to protect your data, including SSL encryption for data in transit and password hashing using bcryptjs. However, no method of transmission over the Internet is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">7. Your Rights</h2>
          <p className="text-base leading-relaxed text-slate-300">
            You have the right to access, update, correct, or delete your personal information at any time by logging into your account or contacting us at support@dialogueroom.com. You may also request that we stop using your information for marketing purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">8. Data Retention</h2>
          <p className="text-base leading-relaxed text-slate-300">
            We retain your account information and messages for as long as your account is active. If you delete your account, we will remove most of your personal information within 30 days, though some data may be retained for legal compliance or fraud prevention purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">9. Children's Privacy</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Dialogue Room is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn we have collected personal information from a child under 18, we will delete such information promptly.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">10. Changes to This Policy</h2>
          <p className="text-base leading-relaxed text-slate-300">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Policy on this page and updating the "Last updated" date above. Your continued use of Dialogue Room constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">11. Contact Us</h2>
          <p className="text-base leading-relaxed text-slate-300">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at{" "}
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
