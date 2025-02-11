import Login from '@/components/auth/Login'
import React from 'react'
export const metadata = {
  title: "Login",
  description:
    "Join Dialogue Room, a platform designed to foster meaningful conversations. Connect with like-minded individuals, learn new skills, and grow through interactive discussions. Whether you're looking to exchange ideas, improve your communication, or just have a good chat, Dialogue Room is the place to be.",
};
const page = () => {
  return (
    <div>
      <Login/>
    </div>
  )
}

export default page
