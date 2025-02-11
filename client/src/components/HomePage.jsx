import React from "react";
import Header from "@/components/ui/Header";
const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />

      <main className="p-4">
        <h1 className="text-3xl font-bold mb-4">Welcome to Dialogue Room</h1>
        <p className="text-lg mb-6">
          Join Dialogue Room, a platform designed to foster meaningful
          conversations. Connect with like-minded individuals, learn new skills,
          and grow through interactive discussions.
        </p>

        <p>
          Whether you're looking to exchange ideas, improve your communication,
          or just have a good chat, Dialogue Room is the place to be. Dive into
          our rooms, meet new people, and start meaningful conversations.
        </p>
      </main>
    </div>
  );
};

export default HomePage;
