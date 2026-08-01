"use client";

import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
    const { settings } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/" && pathname === "/") return true;
        if (path !== "/" && pathname?.startsWith(path)) return true;
        return false;
    };

    const getLinkClass = (path: string) => {
        const baseClass = "px-5 py-2 rounded-full text-[14px] font-bold transition-all duration-300 block";
        const activeClass = "bg-yellow-400 text-red-950 shadow-md";
        const inactiveClass = "hover:bg-red-900/60 hover:text-yellow-100";
        return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
    };

    const getMobileLinkClass = (path: string) => {
        const baseClass = "block px-4 py-2 rounded-lg font-bold transition-colors";
        const activeClass = "bg-yellow-400 text-red-950";
        const inactiveClass = "hover:bg-red-900/60";
        return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
    };

    return (
        <header style={{ fontFamily: 'var(--font-roboto-condensed)' }} className="bg-red-800 text-white shadow-lg sticky top-0 z-50 border-b border-yellow-500/40">
            <div className="w-full px-4 md:px-8 py-3">
                <div className="flex justify-between items-center relative gap-4">
                    {/* Logo & School Name */}
                    <Link href="/" className="group flex items-center gap-3 md:gap-4 flex-shrink-0">
                        <div className="bg-white p-1 md:p-1.5 rounded-full shadow-lg group-hover:scale-105 transition-transform duration-300 ring-2 ring-yellow-400/50 flex-shrink-0 relative w-10 h-10 md:w-12 md:h-12 overflow-hidden">
                            {/* School Icon / Logo Placeholder */}
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-full h-full object-contain p-0.5"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm md:text-xl font-bold tracking-tight text-yellow-300 drop-shadow-md truncate hidden lg:block uppercase">
                                {settings.schoolName || "TRƯỜNG PTDTBT TH&THCS BẢN NGÒ"}
                            </span>
                            <span className="hidden lg:block text-xs text-white/90 font-medium tracking-wider uppercase">
                                {settings.address || "THÔN BẢN NGÒ, XÃ PÀ VẦY SỦ, TỈNH TUYÊN QUANG"}
                            </span>
                            <span className="text-sm font-bold tracking-tight text-yellow-300 drop-shadow-md truncate lg:hidden">
                                {settings.schoolName ? settings.schoolName.substring(0, 20) + "..." : "Trường Bản Ngò"}
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Aligned to Right */}
                    <nav className="hidden md:flex flex-1 justify-end px-4">
                        <ul className="flex flex-wrap justify-center items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 shadow-inner border border-white/20 gap-1 w-fit">
                            <li>
                                <Link href="/" className={getLinkClass("/")}>
                                    TRANG CHỦ
                                </Link>
                            </li>
                            <li>
                                <Link href="/bulletin" className={getLinkClass("/bulletin")}>
                                    BẢNG TIN
                                </Link>
                            </li>
                            {/* TIN TỨC Dropdown */}
                            <li className="relative group/news">
                                <Link href="/news" className={getLinkClass("/news")}>
                                    <div className="flex items-center gap-1">
                                        TIN TỨC
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </Link>
                                <ul className="absolute left-0 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover/news:opacity-100 group-hover/news:translate-y-0 group-hover/news:pointer-events-auto transition-all duration-300 z-50">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-1.5 flex flex-col gap-1 ring-1 ring-black/5">
                                        {[
                                            { label: "Tin tức chung", cat: "Tin tức chung" },
                                            { label: "Chi bộ", cat: "Chi bộ" },
                                            { label: "Hoạt động chuyên môn", cat: "Hoạt động chuyên môn" },
                                            { label: "Công tác Bán trú", cat: "Công tác Bán trú" },
                                            { label: "Hoạt động Đội", cat: "Hoạt động Đội" },
                                            { label: "Y tế - Thư viện", cat: "Y tế - Thư viện" }
                                        ].map((item) => (
                                            <li key={item.cat}>
                                                <Link
                                                    href={`/news?cat=${encodeURIComponent(item.cat)}`}
                                                    className="block px-4 py-2.5 text-[14px] font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </div>
                                </ul>
                            </li>
                            {/* VĂN BẢN Dropdown */}
                            <li className="relative group/docs">
                                <Link href="/documents" className={getLinkClass("/documents")}>
                                    <div className="flex items-center gap-1">
                                        VĂN BẢN
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </Link>
                                <ul className="absolute left-0 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover/docs:opacity-100 group-hover/docs:translate-y-0 group-hover/docs:pointer-events-auto transition-all duration-300 z-50">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-1.5 flex flex-col gap-1 ring-1 ring-black/5">
                                        {[
                                            { label: "Tất cả văn bản", cat: "Tất cả" },
                                            { label: "Văn bản cấp trên", cat: "Văn bản cấp trên" },
                                            { label: "Quyết định", cat: "Quyết định" },
                                            { label: "Báo cáo", cat: "Báo cáo" },
                                            { label: "Kế hoạch", cat: "Kế hoạch" },
                                            { label: "Biểu mẫu", cat: "Biểu mẫu" },
                                            { label: "Thông báo", cat: "Thông báo" }
                                        ].map((item) => (
                                            <li key={item.cat}>
                                                <Link
                                                    href={`/documents?cat=${encodeURIComponent(item.cat)}`}
                                                    className="block px-4 py-2.5 text-[14px] font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </div>
                                </ul>
                            </li>
                            {/* TÀI NGUYÊN Dropdown */}
                            <li className="relative group/resources">
                                <Link href="/resources" className={getLinkClass("/resources")}>
                                    <div className="flex items-center gap-1">
                                        TÀI NGUYÊN
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </Link>
                                <ul className="absolute left-0 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover/resources:opacity-100 group-hover/resources:translate-y-0 group-hover/resources:pointer-events-auto transition-all duration-300 z-50">
                                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-1.5 flex flex-col gap-1 ring-1 ring-black/5">
                                        {[
                                            { label: "Thư viện Ảnh", cat: "Thư viện Ảnh" },
                                            { label: "Video Clip", cat: "Video Clip" },
                                            { label: "Học liệu", cat: "Học liệu" },
                                            { label: "Phần mềm - Ứng dụng", cat: "Phần mềm - Ứng dụng" },
                                            { label: "Sản phẩm của Học sinh", cat: "Sản phẩm của Học sinh" }
                                        ].map((item) => (
                                            <li key={item.cat}>
                                                <Link
                                                    href={`/resources?cat=${encodeURIComponent(item.cat)}`}
                                                    className="block px-4 py-2.5 text-[14px] font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-colors"
                                                >
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </div>
                                </ul>
                            </li>
                            <li>
                                <Link href="/lookup" className={getLinkClass("/lookup")}>
                                    TRA CỨU
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className={getLinkClass("/about")}>
                                    GIỚI THIỆU
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Right Side: Login Icon & Mobile Menu */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Desktop Login Icon */}
                        <Link
                            href="/admin/dashboard"
                            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 border border-white/20"
                            title="Đăng nhập quản trị"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-blue-400/30 animate-in slide-in-from-top-2 duration-200 overflow-y-auto overscroll-contain max-h-[calc(100vh-5rem)] custom-scrollbar">
                        <div className="flex justify-end p-2 px-4">
                            <ThemeToggle />
                        </div>
                        <ul className="space-y-2 mt-2">
                            <li>
                                <Link onClick={() => setIsMenuOpen(false)} href="/" className={getMobileLinkClass("/")}>
                                    TRANG CHỦ
                                </Link>
                            </li>
                            <li>
                                <Link onClick={() => setIsMenuOpen(false)} href="/bulletin" className={getMobileLinkClass("/bulletin")}>
                                    BẢNG TIN
                                </Link>
                            </li>
                            <li>
                                <div className="px-4 py-2 font-bold text-blue-200 text-xs uppercase tracking-widest border-b border-blue-400/20 mb-1">
                                    TIN TỨC
                                </div>
                                <div className="grid grid-cols-1 gap-1 ml-2">
                                    {[
                                        { label: "Tất cả tin tức", href: "/news" },
                                        { label: "Tin tức chung", href: "/news?cat=Tin tức chung" },
                                        { label: "Chi bộ", href: "/news?cat=Chi bộ" },
                                        { label: "Hoạt động chuyên môn", href: "/news?cat=Hoạt động chuyên môn" },
                                        { label: "Công tác Bán trú", href: "/news?cat=Công tác Bán trú" },
                                        { label: "Hoạt động Đội", href: "/news?cat=Hoạt động Đội" },
                                        { label: "Y tế - Thư viện", href: "/news?cat=Y tế - Thư viện" }
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            href={item.href}
                                            className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                            <li className="mt-2">
                                <div className="px-4 py-2 font-bold text-blue-200 text-xs uppercase tracking-widest border-b border-blue-400/20 mb-1">
                                    VĂN BẢN
                                </div>
                                <div className="grid grid-cols-1 gap-1 ml-2">
                                    {[
                                        { label: "Tất cả văn bản", href: "/documents" },
                                        { label: "Văn bản cấp trên", href: "/documents?cat=Văn bản cấp trên" },
                                        { label: "Quyết định", href: "/documents?cat=Quyết định" },
                                        { label: "Báo cáo", href: "/documents?cat=Báo cáo" },
                                        { label: "Kế hoạch", href: "/documents?cat=Kế hoạch" },
                                        { label: "Biểu mẫu", href: "/documents?cat=Biểu mẫu" },
                                        { label: "Thông báo", href: "/documents?cat=Thông báo" }
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            href={item.href}
                                            className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                            <li className="mt-2">
                                <div className="px-4 py-2 font-bold text-blue-200 text-xs uppercase tracking-widest border-b border-blue-400/20 mb-1">
                                    TÀI NGUYÊN
                                </div>
                                <div className="grid grid-cols-1 gap-1 ml-2">
                                    {[
                                        { label: "Thư viện Ảnh", href: "/resources?cat=Thư viện Ảnh" },
                                        { label: "Video Clip", href: "/resources?cat=Video Clip" },
                                        { label: "Học liệu", href: "/resources?cat=Học liệu" },
                                        { label: "Phần mềm - Ứng dụng", href: "/resources?cat=Phần mềm - Ứng dụng" },
                                        { label: "Sản phẩm của Học sinh", href: "/resources?cat=Sản phẩm của Học sinh" }
                                    ].map((item) => (
                                        <Link
                                            key={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            href={item.href}
                                            className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </li>
                            <li>
                                <Link onClick={() => setIsMenuOpen(false)} href="/lookup" className={getMobileLinkClass("/lookup")}>
                                    TRA CỨU
                                </Link>
                            </li>
                            <li>
                                <Link onClick={() => setIsMenuOpen(false)} href="/about" className={getMobileLinkClass("/about")}>
                                    GIỚI THIỆU
                                </Link>
                            </li>
                            <li className="pt-2">
                                <Link
                                    onClick={() => setIsMenuOpen(false)}
                                    href="/admin/dashboard"
                                    className="flex items-center gap-2 px-4 py-2 text-yellow-300 font-bold hover:text-yellow-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    ĐĂNG NHẬP
                                </Link>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
}
