"use client";
import { motion } from "framer-motion";
import {
    Brain,
    FileText,
    Mail,
    Send,
    ArrowRight,
    Check,
    Sparkles,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, signOut, useSession } from "next-auth/react";

const workflowSteps = [
    {
        icon: Brain,
        title: "Intent Layer",
        description:
            "Detects and understands your request with advanced AI processing.",
    },
    {
        icon: FileText,
        title: "Summarization Agent",
        description: "Condenses your text into clear, concise summaries.",
    },
    {
        icon: Mail,
        title: "Email Formatting Agent",
        description: "Structures summaries into professional email formats.",
    },
    {
        icon: Send,
        title: "Email Sending",
        description: "Delivers formatted messages via integrated email APIs.",
    },
];

const navItems = [
    {
        title: "Home",
        href: "#",
    },
    {
        title: "How it Works",
        href: "#",
    },
    {
        title: "Contact",
        href: "#",
    },
];

// Floating particles component
const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                    }}
                    animate={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                    }}
                    transition={{
                        duration: Math.random() * 20 + 10,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                    }}
                />
            ))}
        </div>
    );
};

// Geometric shapes component
const GeometricShapes = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
                className="absolute top-20 left-10 w-32 h-32 border border-cyan-400/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                }}
            />
            <motion.div
                className="absolute top-40 right-20 w-24 h-24 border border-blue-400/20"
                animate={{ rotate: -360 }}
                transition={{
                    duration: 15,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                }}
            />
            <motion.div
                className="absolute bottom-40 left-1/4 w-16 h-16 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-xl"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            />
        </div>
    );
};

export default function LandingPage() {
    const { data: sessionData } = useSession();
    const user = sessionData?.user;

    return (
        <div className="min-h-screen relative overflow-hidden bg-black">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
                <div
                    className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_var(--tw-gradient-stops))] from-transparent via-cyan-500/5 to-transparent animate-spin"
                    style={{ animationDuration: "20s" }}
                />
            </div>

            {/* Floating particles */}
            <FloatingParticles />

            {/* Geometric shapes */}
            <GeometricShapes />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Sticky Navbar */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="sticky top-0 z-50 backdrop-blur-2xl bg-black/20 border-b border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 blur-lg opacity-30" />
                            <div className="relative text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
                                QuickBrief
                            </div>
                        </motion.div>

                        <div className="hidden md:flex items-center space-x-8">
                            {navItems.map((item, index) => (
                                <motion.a
                                    key={item.title}
                                    href={item.href}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.3 }}
                                    whileHover={{
                                        y: -2,
                                        textShadow:
                                            "0 0 8px rgba(6,182,212,0.8)",
                                    }}
                                    className="relative text-gray-300 hover:text-cyan-400 px-4 py-2 text-sm font-medium transition-all duration-300 group"
                                >
                                    {item.title}
                                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300" />
                                </motion.a>
                            ))}
                            {user && (
                                <motion.button
                                    onClick={() => signOut()}
                                    whileHover={{
                                        y: -2,
                                        textShadow:
                                            "0 0 8px rgba(239,68,68,0.8)",
                                    }}
                                    className="text-gray-300 hover:text-red-400 px-4 py-2 text-sm font-medium transition-all duration-300"
                                >
                                    Logout
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-40">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight"
                    >
                        Turn Raw Text into{" "}
                        <motion.span
                            className="relative inline-block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                            animate={{
                                backgroundPosition: [
                                    "0% 50%",
                                    "100% 50%",
                                    "0% 50%",
                                ],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                        >
                            Actionable Email Updates
                            <motion.div
                                className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-xl -z-10"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                }}
                            />
                        </motion.span>{" "}
                        — Instantly.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-xl text-gray-400 mt-8 max-w-3xl mx-auto leading-relaxed"
                    >
                        QuickBrief uses cutting-edge AI to intelligently
                        summarize your text and deliver it straight to your
                        inbox with precision and style.
                    </motion.p>

                    {/* Enhanced CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-12"
                    >
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative inline-block"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
                            <Button
                                size="lg"
                                className="relative px-12 py-6 text-xl font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transition-all duration-500 border border-cyan-400/30"
                            >
                                {!user ? (
                                    <span
                                        className="flex items-center gap-3"
                                        onClick={() =>
                                            signIn("google", {
                                                callbackUrl: "/",
                                            })
                                        }
                                    >
                                        <Sparkles className="w-6 h-6" />
                                        Connect to Google
                                        <ArrowRight className="w-6 h-6" />
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        <Check className="w-6 h-6" />
                                        {user.email}
                                        <Sparkles className="w-6 h-6" />
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Enhanced Workflow Section */}
            <section className="py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent" />

                <div className="max-w-7xl mx-auto px-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <motion.div
                            className="inline-block mb-4"
                            animate={{ rotate: [0, 360] }}
                            transition={{
                                duration: 20,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 flex items-center justify-center backdrop-blur-sm border border-cyan-400/30">
                                <Zap className="w-8 h-8 text-cyan-400" />
                            </div>
                        </motion.div>

                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                            How QuickBrief{" "}
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Works
                            </span>
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Our revolutionary AI workflow in four seamless
                            steps.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {workflowSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                                whileHover={{
                                    scale: 1.05,
                                    rotateY: 5,
                                    rotateX: 5,
                                }}
                                className="relative group"
                            >
                                {/* Connection line */}
                                {index < workflowSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-400/50 to-transparent z-10" />
                                )}

                                <div className="relative p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 shadow-2xl hover:shadow-cyan-400/20 hover:border-cyan-300/30 transition-all duration-500 h-full">
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Step number */}
                                    <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                        {index + 1}
                                    </div>

                                    <motion.div
                                        className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25"
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <step.icon className="w-10 h-10 text-white" />
                                    </motion.div>

                                    <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom glow */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-900/10 to-transparent" />
        </div>
    );
}
