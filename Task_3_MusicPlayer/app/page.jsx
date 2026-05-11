"use client"
import Navbar from "@/components/navbar";
import Trending from "@/components/trending";
import RecentlyPlayed from "@/components/recently_played";
import { useSession } from "next-auth/react";
import Artists from "@/components/Artists";
import NewReleases from "@/components/NewReleases";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Home() {
  const session = useSession();
  return (
    <div className="main bg-black flex h-screen overflow-hidden">
      <Navbar />
      <div className="flex-1 md:ml-[260px] overflow-y-auto pb-20 scrollbar-hide">
        <h1 className="text-2xl font-semibold text-[#E4E1E6] ml-5 mb-10 mt-10 px-5"> Welcome , <Link href="/profile" className="text-[#6FFBBE]">{session?.data?.user?.name}</Link></h1>

        <div className="flex flex-col gap-10">
          <RecentlyPlayed showSeeMore={true} limit={3} />
          <NewReleases showSeeMore={true} limit={5} />
          <Artists showSeeMore={true} limit={6} />
          <Trending showSeeMore={true} limit={5} />
        </div>
        <Footer />
      </div>
    </div>
  );
}
