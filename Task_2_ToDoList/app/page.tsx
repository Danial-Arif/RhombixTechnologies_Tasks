'use client'
import Namescreen from "@/components/Namescreen";
import Dashboard from "@/components/Dashboard";
import { useState, useEffect } from "react";
export default function Home() {
  const [username, setUserName] = useState("")

  useEffect(() => {
    const storeduser = localStorage.getItem("username")
    if (storeduser) {
      setUserName(storeduser)
    }
  }, [])

  return (
    <div>
      {!username ? (
        <Namescreen setUserName={setUserName} />
      ) : (
        <Dashboard username={username} />
      )}
    </div>
  );
}