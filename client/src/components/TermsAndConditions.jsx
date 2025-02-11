import Image from "next/image";
import termsAndConditions from "../../public/images/pagesData/termsAndConditions.jpg";

const TermsAndConditions = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-center">
        <Image
          src={termsAndConditions}
          alt="Terms and Conditions"
          layout="intrinsic"
          objectFit="cover"
          className="rounded-lg max-h-[40vh] max-w-[80vw] w-full"
        />
      </div>

      <h1 className="text-3xl font-bold mt-6">Terms and Conditions</h1>

      <p className="mt-4 text-gray-700">
        Welcome to Dialogue Room! By accessing or using our platform, you agree
        to comply with the following Terms and Conditions. Please read them
        carefully.
      </p>

      <h2 className="text-xl font-semibold mt-6">1. Acceptance of Terms</h2>
      <p className="text-gray-700">
        By using Dialogue Room, you agree to be bound by these Terms. If you do
        not agree, please do not use our services.
      </p>

      <h2 className="text-xl font-semibold mt-6">2. User Responsibilities</h2>
      <p className="text-gray-700">
        - You must be at least 13 years old to use our platform. <br />
        - Do not engage in harmful, illegal, or abusive behavior. <br />-
        Respect other users and maintain a positive community environment.
      </p>

      <h2 className="text-xl font-semibold mt-6">3. Privacy and Data Usage</h2>
      <p className="text-gray-700">
        We value your privacy. Please review our{" "}
        <a href="/privacy-policy" className="text-blue-600">
          Privacy Policy
        </a>{" "}
        to understand how we handle your data.
      </p>

      <h2 className="text-xl font-semibold mt-6">
        4. Account Suspension and Termination
      </h2>
      <p className="text-gray-700">
        We reserve the right to suspend or terminate accounts that violate these
        Terms. Actions such as harassment, spamming, or illegal activity may
        result in permanent account removal.
      </p>

      <h2 className="text-xl font-semibold mt-6">5. Limitation of Liability</h2>
      <p className="text-gray-700">
        Dialogue Room is not responsible for any direct or indirect damages
        resulting from the use of our platform.
      </p>

      <h2 className="text-xl font-semibold mt-6">6. Changes to Terms</h2>
      <p className="text-gray-700">
        We may update these Terms at any time. Continued use of Dialogue Room
        after changes signifies your acceptance.
      </p>

      <h2 className="text-xl font-semibold mt-6">7. Contact Us</h2>
      <p className="text-gray-700">
        If you have any questions about these Terms, feel free to{" "}
        <a href="/contact" className="text-blue-600">
          contact us
        </a>
        .
      </p>
    </div>
  );
};

export default TermsAndConditions;
