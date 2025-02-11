import { cookies } from "next/headers";
import HomeAuth from "@/components/HomeAuth";
import HomePage from "@/components/HomePage";

export default async function Home() {
  const token = (await cookies()).get("token");

  return <div>{token ? <HomeAuth /> : <HomePage />}</div>;
}
