import React from "react";
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { redirect } from "react-router-dom";
import { API_BASE } from '../config.js'

const signUpUser = async (name, email, password) => {
    const user = {
        "name" : name,
        "email" : email,
        "password" : password
    };
    console.log(JSON.stringify(user));
    const response = await fetch(`${API_BASE}/auth/v1/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    });
    console.log(await response.text());
    return response;
};

const SignUpPage = () => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();
    useEffect(() => {
        document.title = "InteractiveQ - SignUp";
        const token = localStorage.getItem('refreshToken');
        if (token) {
            navigate('/chat');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(false);
        try{
            const response = await signUpUser(fullName, email, password);
            if(response.ok){
                console.log("Account created succesfully");
                navigate('/signin');
                // redirect("/Sign")
            }
            else{
                setError(true);
                setErrorMessage(await response.text());
            }
        }
        catch(error){
            setError(true);
            setErrorMessage("Error occured while creating your account");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md card p-6">
                <div className="text-center mb-4">
                    <h1 className="text-2xl font-semibold">Create an Account</h1>
                </div>

                {error && (
                    <div id="error" className="mb-4 text-sm rounded-md border border-red-500/30 bg-red-500/10 text-red-300 px-3 py-2">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm text-neutral-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            value = {fullName}
                            onChange= {(e) => {setFullName(e.target.value)}}
                            required
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm text-neutral-300 mb-1">Email address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e)=>{setEmail(e.target.value)}}
                            required
                            className="input"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm text-neutral-300 mb-1">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e)=>{setPassword(e.target.value)}}
                            required
                            className="input"
                        />
                    </div>
                    <div className="flex items-start gap-2 text-sm text-neutral-300">
                        <input type="checkbox" id="terms" name="terms" required className="mt-1 accent-white" />
                        <label htmlFor="terms" className="leading-5">
                            I agree to the <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>.
                        </label>
                    </div>
                    <button type="submit" className="w-full btn">
                        Create Account
                    </button>
                </form>
                <p className="mt-4 text-sm text-neutral-400 text-center">
                    Already have an account? <Link to="/signin" className="underline hover:text-white">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;
