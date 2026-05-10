'use client';

import Navbar from "@/components/navbar";
import Artists from "@/components/Artists";
import Footer from "@/components/Footer";

export default function AllArtistsPage() {
    return (
        <div className="min-h-screen bg-black text-white md:ml-[260px] overflow-y-auto scrollbar-hide">
            <Navbar />
            <div className="py-10">
                <Artists showPagination={true} limit={20} />
            </div>
            <Footer />
        </div>
    );
}
