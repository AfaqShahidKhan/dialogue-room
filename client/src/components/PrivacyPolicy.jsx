import React from "react";
import Header from "@/components/ui/Header";
import Image from "next/image";
const PrivacyPolicy = () => {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="flex justify-center">
          <Image
            src="/images/pagesData/privacyPolicy.jpg"
            alt="Privacy Policy"
            width={800}
            height={450}
            // style={{ objectFit: "cover" }}
            objectFit="cover"
            className="rounded-lg max-h-[40vh] max-w-[80vw] w-full"
          />
        </div>
        <p className="mb-4">
          Welcome to Dialogue Room! Your privacy is important to us. This
          Privacy Policy explains how we collect, use, and protect your
          information when you use our platform.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          1. Information We Collect
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Personal Information: Name, email, profile photo, and contact
            details.
          </li>
          <li>
            Usage Data: Messages, interactions, preferences, and engagement
            metrics.
          </li>
          <li>
            Device Information: IP address, browser type, operating system, and
            device model.
          </li>
          <li>
            Cookies and Tracking: We use cookies to enhance your experience and
            analyze site traffic.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide and improve our services.</li>
          <li>To personalize your experience and content recommendations.</li>
          <li>
            For security, fraud prevention, and compliance with legal
            obligations.
          </li>
          <li>
            To communicate with you regarding updates, support, and promotions.
          </li>
          <li>To conduct research and analysis for service enhancements.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          3. Data Sharing & Security
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>We do not sell your personal data.</li>
          <li>
            We may share data with trusted third parties for service
            improvements and analytics.
          </li>
          <li>
            We implement strong security measures to protect your data from
            unauthorized access.
          </li>
          <li>
            Your data is encrypted during transmission and stored securely.
          </li>
          <li>
            Access to your data is restricted to authorized personnel only.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          4. Your Choices & Rights
        </h2>
        <ul className="list-disc pl-6 mb-4">
          <li>You can update or delete your account at any time.</li>
          <li>You can opt out of marketing communications.</li>
          <li>Request a copy of your data by contacting support.</li>
          <li>Manage cookie preferences through your browser settings.</li>
          <li>
            Control what information you share with us in your account settings.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          5. Cookies & Tracking Technologies
        </h2>
        <p className="mb-4">
          We use cookies, beacons, and tracking technologies to improve user
          experience and analytics. You can disable cookies in your browser
          settings, but some features may not function properly.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          6. Third-Party Services
        </h2>
        <p className="mb-4">
          We may use third-party services for analytics, authentication, and
          advertisements. These services have their own privacy policies
          governing the collection and use of your data.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          7. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update this policy from time to time. Any changes will be
          communicated via email or through our platform.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">
          8. Compliance with Legal Requirements
        </h2>
        <p className="mb-4">
          We comply with applicable privacy laws and regulations, including GDPR
          and CCPA. If you are a resident of the EU or California, you have
          additional data protection rights.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-2">9. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us
          at <strong>support@dialogueroom.com</strong>.
        </p>
      </div>
    </>
  );
};

export default PrivacyPolicy;
