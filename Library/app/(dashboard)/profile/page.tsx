"use client";

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Profile from "@/components/Profile";

function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openUpload = searchParams.get("upload") === "true";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  if (status === "loading" || !session?.user) {
    return null;
  }

  return <Profile user={session.user} openUpload={openUpload} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}
