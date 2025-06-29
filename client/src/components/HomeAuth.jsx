import Image from "next/image";
import React from "react";

const HomeAuth = () => {
  return (
    <>
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">
          Welcome to <span className="text-dark-primary">Dialogue Room</span>
        </h1>

        <p className="max-w-2xl text-lg mb-10">
          Connect with people worldwide and enhance your language skills through
          meaningful conversations.
        </p>

        <div className="w-full max-w-[500px]">
          <Image
            src="/images/svgs/OnlineWorldCuate.svg"
            width={500}
            height={500}
            alt="Global Chat Illustration"
            className="w-full h-auto"
            priority
          />
        </div>
      </section>
    </>
  );
};

export default HomeAuth;
