import { Metadata } from "next";
import Image from "next/image";
import { CornerCloud } from "@/components/marketing/CornerCloud";

export const metadata: Metadata = {
  title: "Terms of Service — Dialogue Room",
  description: "Terms and conditions for using Dialogue Room",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <article className="space-y-8">
        <div>
          <div className="relative mb-6 aspect-[21/9] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          <CornerCloud corner="tr" />
            <Image
              src="/images/termsAndConditions.jpg"
              alt=""
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
          <p className="text-sm text-slate-400">Last updated: August 28, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">1. Acceptance of Terms</h2>
          <p className="text-base leading-relaxed text-slate-300">
            By accessing and using Dialogue Room, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">2. Use License</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Permission is granted to temporarily download one copy of the materials on Dialogue Room for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-300">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer, disassemble, or decompile any software</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            <li>Harass, threaten, or intimidate other users</li>
            <li>Spam, scam, or engage in fraudulent activities</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">3. Disclaimer</h2>
          <p className="text-base leading-relaxed text-slate-300">
            The materials on Dialogue Room are provided "as is". Dialogue Room makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">4. Limitations</h2>
          <p className="text-base leading-relaxed text-slate-300">
            In no event shall Dialogue Room or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Dialogue Room, even if a representative of Dialogue Room has been notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">5. Accuracy of Materials</h2>
          <p className="text-base leading-relaxed text-slate-300">
            The materials appearing on Dialogue Room could include technical, typographical, or photographic errors. Dialogue Room does not warrant that any of the materials on its platform are accurate, complete, or current. Dialogue Room may make changes to the materials contained on its platform at any time without notice.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">6. Links</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Dialogue Room has not reviewed all of the sites linked to its platform and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Dialogue Room of the site. Use of any such linked website is at the user's own risk.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">7. Modifications</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Dialogue Room may revise these Terms of Service for its platform at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these Terms of Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">8. Governing Law</h2>
          <p className="text-base leading-relaxed text-slate-300">
            The materials appearing on Dialogue Room are governed by and construed in accordance with the laws of the jurisdiction in which Dialogue Room operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">9. Account Responsibility</h2>
          <p className="text-base leading-relaxed text-slate-300">
            You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to notify Dialogue Room immediately of any unauthorized use of your account. Dialogue Room is not liable for any loss resulting from unauthorized use of your account.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">10. Prohibited Conduct</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Users agree not to engage in any conduct that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-slate-300">
            <li>Violates any laws or regulations</li>
            <li>Infringes on the intellectual property rights of others</li>
            <li>Is defamatory, obscene, or abusive</li>
            <li>Disrupts the normal flow of dialogue in Dialogue Room communities</li>
            <li>Attempts to gain unauthorized access to the platform or its systems</li>
            <li>Impersonates another user or misrepresents your identity</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">11. Termination</h2>
          <p className="text-base leading-relaxed text-slate-300">
            Dialogue Room may terminate or suspend your account and access to the platform at any time, without notice or liability, if you violate any of these Terms of Service or for any other reason at our sole discretion.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-white">12. Contact Us</h2>
          <p className="text-base leading-relaxed text-slate-300">
            If you have any questions about these Terms of Service, please contact us at{" "}
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
