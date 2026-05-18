'use client'
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Sparkles, Mail, Lock, LogIn, Loader2, User, AtSign } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Login() {
    const router = useRouter()
    const [isRegister, setIsRegister] = useState(false)
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleGoogleLogin = async () => {
        await signIn("google", { callbackUrl: "/" })
    }

    const handleCredentialsLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (res?.error) {
                setError(res.error)
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, username, email, password }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            // Auto sign in after registration
            setSuccess("Account created! Signing in...")
            const signInRes = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (signInRes?.error) {
                setError("Account created but sign-in failed. Please log in manually.")
                setIsRegister(false)
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-background items-center justify-center p-6">
            <Card className="w-full max-w-md shadow-2xl border-border/50">
                <CardHeader className="text-center space-y-4 pt-8">
                    <div className="mx-auto bg-primary/10 w-16 h-16 flex items-center justify-center rounded-2xl">
                        <Sparkles size={32} className="text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-extrabold tracking-tight">
                        {isRegister ? "Create Account" : "Welcome Back"}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {isRegister ? "Join the Nexus community" : "Sign in to your Nexus account"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 p-3 rounded-xl text-sm text-center">
                            {success}
                        </div>
                    )}

                    {!isRegister && (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 h-12 text-base font-medium"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Continue with Google
                            </Button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-border"></div>
                                <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm uppercase text-xs tracking-wider font-semibold">or</span>
                                <div className="flex-grow border-t border-border"></div>
                            </div>
                        </>
                    )}

                    <form onSubmit={isRegister ? handleRegister : handleCredentialsLogin} className="flex flex-col gap-4">
                        {isRegister && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input
                                        type="text"
                                        placeholder="Full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="pl-10 h-12"
                                    />
                                </div>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <Input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        required
                                        minLength={3}
                                        maxLength={30}
                                        className="pl-10 h-12"
                                    />
                                </div>
                            </>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-10 h-12"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                type="password"
                                placeholder={isRegister ? "Password (min 6 chars)" : "Password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={isRegister ? 6 : undefined}
                                className="pl-10 h-12"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base font-semibold mt-2"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : <LogIn size={20} className="mr-2" />}
                            {isRegister ? "Create Account" : "Sign In"}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center pb-8">
                    <Button
                        variant="link"
                        onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
                        className="text-primary hover:text-primary/80"
                    >
                        {isRegister ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}