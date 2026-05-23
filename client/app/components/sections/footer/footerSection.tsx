"use client"

import Link from "next/link"
import {useTranslations} from "next-intl";

const FooterSection = () => {
    const year = new Date().getFullYear()
    const tapeText = Array(15).fill("NEUMY BEATS").join(" • ")
    const t = useTranslations('footer');

    return (
        <footer className="relative bg-black text-white pt-24 pb-10 mb-[85px] overflow-visible">
            {/* crossing tapes */}
            <div className="absolute top-[-45px] left-0 w-full overflow-visible">
                {/* white tape with red borders */}
                <div
                    className="absolute -rotate-4 left-[-10%] w-[120%] bg-white text-black font-extrabold uppercase text-2xl py-2 tracking-wider border-y-[6px]"
                    style={{
                        borderColor: "var(--primary-red)",
                    }}
                >
                    <div className="whitespace-nowrap">{tapeText}</div>
                </div>

                {/* red tape with black borders */}
                <div
                    className="absolute rotate-4 right-[-10%] top-8 w-[120%] bg-[var(--primary-red)] text-white font-extrabold uppercase text-2xl py-2 tracking-wider border-y-[6px] border-black"
                >
                    <div className="whitespace-nowrap">{tapeText}</div>
                </div>
            </div>

            {/* footer content */}
            <div className="relative z-10 flex flex-col items-center gap-4 mt-24 text-center">
                <nav className="flex gap-8 text-lg uppercase font-bold">
                    <Link
                        href="https://www.instagram.com/"
                        target="_blank"
                        className="hover:text-[var(--primary-red)] transition-colors"
                    >
                        Instagram
                    </Link>
                    <Link
                        href="https://www.tiktok.com/"
                        target="_blank"
                        className="hover:text-[var(--primary-red)] transition-colors"
                    >
                        TikTok
                    </Link>
                    <Link
                        href="https://www.facebook.com/"
                        target="_blank"
                        className="hover:text-[var(--primary-red)] transition-colors"
                    >
                        Facebook
                    </Link>
                </nav>

                <p className="text-sm opacity-70 mt-4 font-semibold tracking-wide">
                    © {year} Neumy Beats. {t("rights")}.
                </p>
            </div>
        </footer>
    )
}

export default FooterSection
