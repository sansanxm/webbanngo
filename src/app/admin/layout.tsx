"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user && pathname !== "/admin/login") {
                router.push("/admin/login");
            } else if (user && pathname === "/admin/login") {
                router.push("/admin/dashboard");
            }
        }
        // Close mobile menu on route change
        setIsMobileMenuOpen(false);
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user && pathname !== "/admin/login") {
        return null; // Prevent rendering protected content while redirecting
    }

    if (user && pathname === "/admin/login") {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const NavLinks = () => (
        <ul className="space-y-2">
            <li>
                <Link href="/admin/dashboard" className={`block p-3 rounded-lg transition-colors ${pathname === '/admin/dashboard' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                    📊 Bảng Điều Khiển
                </Link>
            </li>
            <li>
                <Link href="/admin/posts" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/admin/posts') ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                    📰 Tin Tức
                </Link>
            </li>
            <li>
                <Link href="/admin/bulletin" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/admin/bulletin') ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                    📢 Bảng Tin
                </Link>
            </li>
            <li>
                <Link href="/admin/documents" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/admin/documents') ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                    📂 Văn Bản
                </Link>
            </li>
            <li>
                <Link href="/admin/resources" className={`block p-3 rounded-lg transition-colors ${pathname.startsWith('/admin/resources') ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                    🖼️ Tài Nguyên
                </Link>
            </li>
            <li>
                <Link href="/admin/profile" className={`block p-3 rounded-lg transition-colors ${pathname === '/admin/profile' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                    👤 Hồ Sơ
                </Link>
            </li>
            <li>
                <Link href="/admin/settings" className={`block p-3 rounded-lg transition-colors ${pathname === '/admin/settings' ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-gray-100 text-gray-700'}`}>
                    ⚙️ Cấu Hình
                </Link>
            </li>
            <li className="mt-8 border-t pt-4">
                <Link href="/" className="block p-3 text-blue-600 hover:text-blue-800 font-medium flex items-center">
                    &larr; Về Trang Chủ
                </Link>
            </li>
        </ul>
    );

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white shadow-xl hidden md:flex flex-col z-20">
                <div className="p-6 border-b flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-blue-700">Quản Trị</h1>
                </div>
                <nav className="flex-1 p-4 overflow-y-auto">
                    <NavLinks />
                </nav>
            </aside>

            {/* Mobile Header & Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="bg-white shadow-md p-4 flex justify-between items-center md:hidden z-20 relative">
                    <h1 className="text-xl font-bold text-blue-700">Trang Quản Trị</h1>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                            onClick={() => setIsMobileMenuOpen(false)}
                        ></div>

                        {/* Drawer */}
                        <div className="relative bg-white w-64 max-w-xs h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
                            <div className="p-6 border-b flex justify-between items-center bg-blue-50">
                                <h1 className="text-xl font-bold text-blue-700">Menu</h1>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <nav className="flex-1 p-4 overflow-y-auto">
                                <NavLinks />
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
