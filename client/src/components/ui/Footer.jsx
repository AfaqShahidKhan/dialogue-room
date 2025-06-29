import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

const logo = "/logos/logo.png";

const Footer = () => {
  return (
    <footer className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div className="text-center md:text-left">
            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                width={150}
                height={50}
                className="mx-auto my-auto md:my-0 md:mx-0"
              />
            </Link>
            <p className="mt-4 text-sm">
              &copy; 2025 Dialogue Room. All rights reserved.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/features">Features</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/terms">Terms & Conditions</Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-bold text-lg mb-4">Follow Us</h4>
            <div className="flex justify-center md:justify-start space-x-6">
              <Link href="https://facebook.com">
                <span className="text-xl">
                  <FaFacebook />
                </span>
              </Link>
              <Link href="https://twitter.com">
                <span className="text-xl">
                  <FaTwitter />
                </span>
              </Link>
              <Link href="https://instagram.com">
                <span className="text-xl">
                  <FaInstagram />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm">
            <Link href="/privacy-policy">Privacy Policy</Link>
            {" | "}
            <Link href="/cookie-policy">Cookie Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
