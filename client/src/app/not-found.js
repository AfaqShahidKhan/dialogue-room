"use client";
import Header from "@/components/ui/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React from "react";

const NotFound = () => {
  const router = useRouter();

  const notFoundImg = "/icons/notFound.png"; 
  return (
    <div className="w-full h-screen relative">
      <Header />

      <div className="flex flex-col justify-center items-center min-h-[89vh] relative z-10">
        <div className="flex flex-col gap-4 items-center text-center">
          <Image
            src={notFoundImg}
            alt="not found"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h2 className="text-4xl font-bold">Not Found</h2>
          <p className="text-lg">Could not find the requested resource.</p>
          <div className="flex gap-4 items-center">
            <Link
              href="/"
              className="p-2 px-4 rounded bg-dark-primary text-dark-foreground"
            >
              Home
            </Link>
            <button
              onClick={() => {
                router.back();
              }}
              className="p-2 px-4 rounded bg-dark-muted text-dark-foreground"
              aria-label="Go back to previous page"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
