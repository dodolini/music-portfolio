"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"
import {useTranslations} from "next-intl";

const ContactSection = () => {
    const [hovered, setHovered] = useState(false)
    const [formData, setFormData] = useState({ name: "", email: "", message: "" })
    const t = useTranslations('contact');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json().catch(() => ({}))

            if (!res.ok) {
                if (res.status === 401 && data?.authUrl) {
                    const proceed = confirm('Email sending is not authorized yet. You will be redirected to connect Gmail. Continue?')
                    if (proceed) {
                        window.location.href = '/api/auth/gmail/init'
                    }
                } else {
                    alert(data?.error || 'Error sending message')
                }
                return
            }

            setFormData({ name: '', email: '', message: '' })
            alert('Message sent')
        } catch (err) {
            alert('Unexpected error. Please try again later.')
        }
    }

    return (
        <section className="relative w-full h-screen overflow-hidden bg-black text-white">
            {/* background image */}
            <Image
                src="/studio_1.jpg"
                alt="Music Studio"
                fill
                priority
                className="object-cover opacity-30"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

            {/* content */}
            <div className="relative z-10 flex flex-col justify-center items-center h-full px-6">
                <motion.h2
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-7xl md:text-8xl font-black uppercase tracking-tighter text-center mb-16"
                    style={{
                        textShadow: "3px 3px 0 #ff004d, 6px 6px 0 #00f0ff",
                    }}
                >
                    {t("header")}
                </motion.h2>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="w-full max-w-5xl bg-white text-black border-4 border-black"
                    style={{
                        boxShadow: hovered ? "14px 14px 0 cyan" : "8px 8px 0 #000",
                        transition: "box-shadow 0.25s ease",
                    }}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* LEFT – FORM FIELDS */}
                        <div className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label htmlFor="name" className="font-bold text-xl uppercase">
                                    {t("name")}
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-black bg-transparent focus:bg-yellow-200 focus:outline-none transition-all duration-200 text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="font-bold text-xl uppercase">
                                    {t("email")}
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-black bg-transparent focus:bg-pink-200 focus:outline-none transition-all duration-200 text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="font-bold text-xl uppercase">
                                    {t("message")}
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full p-4 border-2 border-black bg-transparent focus:bg-cyan-200 focus:outline-none transition-all duration-200 resize-none text-lg"
                                />
                            </div>

                            <motion.button
                                whileHover={{
                                    scale: 1.05,
                                    rotate: 2,
                                    backgroundColor: "var(--primary-red)",
                                    color: "#000",
                                    transition: { duration: 0 },
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                type="submit"
                                className="w-full py-5 bg-black text-white border-2 border-black font-bold text-xl uppercase tracking-wide transition-all"
                            >
                                {t("send")}
                            </motion.button>
                        </div>

                        <div className="relative hidden md:block">
                            <Image
                                src="/neum_studio.jpg"
                                alt="Neumy in Studio"
                                fill
                                priority
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20  border-l-6 border-black" />
                        </div>
                    </div>
                </motion.form>

            </div>
        </section>
    )
}

export default ContactSection
