import React from "react";
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { API_BASE } from '../config.js'
import { ThemeToggleButton } from '../theme/ThemeProvider.jsx'

const signInUser = async (email, password) => {
    const user = {
        "email": email,
        "password": password
    };
    console.log(JSON.stringify(user));
    const response = await fetch(`${API_BASE}/auth/v1/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    // console.log(await response.json());
    if (response.ok) {
        const { refreshToken, sessionToken } = await response.json();
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("sessionToken", sessionToken);
        return true;
    }
    else {
        console.log("Throwing Error");
        throw new Error("Error While Logging In");
    }
}

const SignInPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    useEffect(() => {
        document.title = "InteractiveQ - Log In";
        const token = localStorage.getItem('refreshToken');
        if (token) {
            navigate('/chat');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        setError(false);
        e.preventDefault();
        try {
            await signInUser(email, password);
            console.log("Handled the Log in");
            navigate('/chat');
        }
        catch (error) {
            setError(true);
            setErrorMessage(error.message);
            console.log(error.message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
             {/* Floating background elements */}
             <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
             </div>
            
            <div className="absolute top-4 right-4">
                <ThemeToggleButton />
            </div>

            <div className="w-full max-w-md card p-8 backdrop-blur-xl bg-white/40 dark:bg-black/40 border border-white/50 dark:border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-brand-gradient bg-clip-text text-transparent inline-block mb-2">Welcome Back</h1>
                    <p className="text-neutral-500 dark:text-neutral-400">Sign in to continue to InteractiveQ</p>
                </div>

                {error && (
                    <div id="error" className="mb-6 text-sm rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-300 px-4 py-3 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {errorMessage}
                    </div>
                )}

                <form id="signin-form" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 ml-1">Email address</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); }}
                            className="input bg-white/50 dark:bg-black/20"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5 ml-1">
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
                            <a href="#" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 transition-colors">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            id="password"
                            required
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); }}
                            className="input bg-white/50 dark:bg-black/20"
                        />
                    </div>
                    <button type="submit" className="w-full btn py-3 text-base shadow-brand-500/25 hover:shadow-brand-500/40">
                        Sign In
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                    Don't have an account? <Link to="/signup" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">Create account</Link>
                </p>
            </div>
    </div>
    );

};

export default SignInPage;