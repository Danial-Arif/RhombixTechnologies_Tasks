"use client";

import { useState } from "react";
import { User } from "lucide-react";

export default function UserAvatar({ user, className = "w-8 h-8", iconClassName = "w-4 h-4" }) {
  const [failed, setFailed] = useState(false);
  const showImage = user?.image && !failed;

  if (showImage) {
    return (
      <img
        src={user.image}
        alt={user.name || "Profile"}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${className} object-cover`}
      />
    );
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <div
      className={`${className} bg-accent-muted flex items-center justify-center text-accent font-semibold text-xs`}
      aria-label={user?.name || "Profile"}
    >
      {initials || <User className={iconClassName} />}
    </div>
  );
}
