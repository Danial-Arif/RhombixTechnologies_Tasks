'use client'

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SettingsRedirect() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return
        if (session?.user?.id) {
            router.replace(`/profile/${session.user.id}?tab=settings`)
        } else {
            router.replace('/login')
        }
    }, [session, status, router])

    return null
}
