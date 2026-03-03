import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
        await axios.post("http://localhost:3001/signup", {
        name,
        email,
        password,
        });

        navigate("/signin");
    } catch (err: any) {
        setError(
        err.response?.data?.error || "Something went wrong. Please try again."
        );
    } finally {
        setIsLoading(false);
    }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-center">Sign Up</h1>

                {error && <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing up..." : "Sign Up"}
                    </Button>
                </form>

                <div className="text-sm text-center">
                    Already have an account?? <span className="text-blue-500 cursor-pointer" onClick={() => navigate("/signin")}>Sign in</span>
                </div>
            </div>
        </div>
    );
}