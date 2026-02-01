import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'
import { ThemeToggleButton } from '../theme/ThemeProvider.jsx'

const HomePage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        document.title = "InteractiveQ - Home";
        const token = localStorage.getItem('refreshToken');
        if (token) {
            navigate('/chat');
        }
    }, [navigate]);
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
             {/* Floating elements for lovely effect */}
             <div className="absolute top-20 left-10 w-32 h-32 bg-brand-300/30 rounded-full blur-3xl animate-float -z-10"></div>
             <div className="absolute bottom-40 right-10 w-40 h-40 bg-secondary-300/30 rounded-full blur-3xl animate-float -z-10" style={{animationDelay: '2s'}}></div>

            <header className="sticky top-0 z-40 backdrop-blur-md border-b border-white/20 dark:border-white/5 bg-white/30 dark:bg-neutral-900/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <span className="text-3xl animate-pulse-slow">💬</span>
                        <span className="text-gradient font-bold">InteractiveQ</span>
                    </div>
                    <nav className="flex items-center gap-3">
                        <ThemeToggleButton />
                        <button
                            className="btn-outline hidden sm:inline-flex"
                            onClick={()=>{navigate('/signin')}}
                        >
                            Log In
                        </button>
                        <button
                            className="btn"
                            onClick={()=>{navigate('/signup')}}
                        >
                            Sign Up
                        </button>
                    </nav>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center">
                <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 text-center">
                    <div className="mx-auto max-w-3xl space-y-8 animate-fade-in-up">
                        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
                            Make your meetings <br/>
                            <span className="text-gradient">Lovely & Interactive</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            Create beautiful Q&A sessions, live polls, and more. 
                            Engage your audience with an interface they'll love.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                className="btn text-lg px-8 py-3 shadow-brand-500/40 hover:shadow-brand-500/60"
                                onClick={()=>{navigate('/signup')}}
                            >
                                Get Started for Free
                            </button>
                            <Link to="/signin" className="btn-ghost text-base">I already have an account</Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/20 dark:border-white/5 bg-white/20 dark:bg-neutral-900/20 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
                    <p>© 2024 InteractiveQ. Built with ❤️.</p>
                    <nav className="flex items-center gap-6">
                        <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Terms</a>
                        <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Privacy</a>
                    </nav>
                </div>
            </footer>
        </div>
    )
}

export default HomePage;