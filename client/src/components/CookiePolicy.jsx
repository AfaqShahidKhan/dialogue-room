import React from "react";
import Header from "@/components/ui/Header";
import Image from "next/image";

const CookiePolicy = () => {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        <div className="flex justify-center">
          <Image
            src="/images/pagesData/cookieData.jpg"
            alt="cookie Policy"
            width={800}
            height={450} 
            style={{ objectFit: "cover" }} 
            className="rounded-lg max-h-[40vh] max-w-[80vw] w-full"          />
        </div>
        <p className="mb-4">
          This Cookie Policy explains how Dialogue Room uses cookies and similar tracking technologies
          when you visit our platform.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">1. What Are Cookies?</h2>
        <p className="mb-4">
          Cookies are small text files stored on your device when you visit a website. They help in
          improving your browsing experience by remembering your preferences and login details.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Cookies</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>To remember your preferences and settings.</li>
          <li>To analyze website traffic and user interactions.</li>
          <li>For authentication and session management.</li>
          <li>To provide personalized content and advertisements.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">3. Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Essential Cookies:</strong> Required for basic site functionality.</li>
          <li><strong>Analytics Cookies:</strong> Help us understand user behavior and improve our services.</li>
          <li><strong>Functional Cookies:</strong> Store user preferences for a customized experience.</li>
          <li><strong>Advertising Cookies:</strong> Used to show relevant ads based on user interests.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">4. Managing Your Cookies</h2>
        <p className="mb-4">
          You can control and disable cookies through your browser settings. However, disabling some cookies
          may affect your experience on our platform.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">5. Third-Party Cookies</h2>
        <p className="mb-4">
          We may use third-party services like Google Analytics, which set their own cookies to track
          website usage and performance.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">6. Changes to This Cookie Policy</h2>
        <p className="mb-4">
          We may update this policy periodically. Any changes will be communicated through our platform.
        </p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">7. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Cookie Policy, please contact us at <strong>support@dialogueroom.com</strong>.
        </p>
      </div>
    </>
  );
};

export default CookiePolicy;