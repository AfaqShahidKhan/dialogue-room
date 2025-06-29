import React from "react";
import Header from "@/components/ui/Header";
import Link from "next/link";
import Image from "next/image";

const onlineDiscussion = "/images/pagesData/onlineDiscussion.jpg";
const virtualConversation = "/images/pagesData/virtualConversation.jpg";
const boyChatting = "/images/pagesData/boyChatting.jpg";

const homeDataArray = [
  {
    title: "Instant Messaging",
    desc: "Chat with friends or meet new people instantly.",
    icon: "/Icons/message.png",
  },
  {
    title: "Voice & Video Calls",
    desc: "Connect beyond text with voice and video.",
    icon: "/Icons/camera.png",
  },
  {
    title: "Disscussion Rooms",
    desc: "Join open discussions or create private rooms.",
    icon: "/Icons/groupPeople.png",
  },
  {
    title: "Language Exchange",
    desc: "Talk to native speakers and improve your skills.",
    icon: "/Icons/language1.png",
  },
];
const HomePage = () => {
  return (
    <div className="min-h-screen ">
      <Header />

      <section className="relative w-full h-[80vh] flex flex-col items-center justify-center text-center ">
        <div className="absolute inset-0">
          <Image
            src={onlineDiscussion}
            alt="Chat App Hero Background"
            fill
            priority
            style={{ objectFit: "cover" }}
            className="opacity-60"
          />
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-bold drop-shadow-lg">
            Connect. Communicate. Collaborate.
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            Join <strong>Dialogue Room</strong> and start meaningful
            conversations with people worldwide. Whether for learning,
            networking, or just chatting—this is your space.
          </p>
          <Link href="/register">
            <button className="mt-6 px-6 py-3  font-bold rounded-lg shadow-md bg-dark-primary transition">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      <section className="py-12 ">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Why Join Dialogue Room?</h2>
          <div className="grid md:grid-cols-4 gap-6 px-6">
            {homeDataArray.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={60}
                  height={60}
                  className="mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 ">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2">
            <Image
              src={virtualConversation}
              alt="Virtual Conversation"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>

          <div className="w-full md:w-1/2 md:pl-10 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">
              Engage in Virtual Conversations
            </h2>
            <p className="text-lg ">
              Dive into meaningful conversations with people from around the
              globe. Whether you're discussing trending topics, learning a new
              language, or just sharing experiences, Dialogue Room makes it easy
              and enjoyable.
            </p>
            <Link href="/chat">
              <button className="mt-6 px-6 py-3 font-semibold rounded-lg shadow-md  bg-dark-primary transition">
                Start Chatting
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 ">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 md:pl-10 text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Exchange Languages</h2>
            <p className="text-lg ">
              Connect with people worldwide and engage in meaningful language
              exchanges. Whether you're practicing a new language, learning
              about different cultures, or just having fun conversations,
              Dialogue Room makes it simple and enjoyable for you to connect
              with others.
            </p>
            <Link href="/search">
              <button className="mt-6 px-6 py-3 font-semibold rounded-lg shadow-md  bg-dark-primary transition">
                Find People
              </button>
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <Image
              src={boyChatting}
              alt="Exchange Languages"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      <section className="py-16 ">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Join a Thriving Community</h2>
          <p className="mt-4 text-lg ">
            Thousands of users are already engaging in insightful conversations.
            Don't miss out!
          </p>
          <Link href="/register">
            <button className="mt-6 px-6 py-3 font-semibold rounded-lg shadow-md  bg-dark-primary transition">
              Join Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
