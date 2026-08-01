"use client";
import { useSettings } from "@/context/SettingsContext";
import Image from "next/image";

export default function PrincipalWelcome() {
    const { settings } = useSettings();

    // Default Fallbacks
    const principalName = settings.principalName || "Cô Nông Thị Lượng";
    const message = settings.principalMessage || "Chào mừng các em học sinh thân yêu đến với ngôi nhà thứ hai của chúng ta. Nơi đây, các em sẽ được học tập, vui chơi và trưởng thành mỗi ngày.";
    const imageUrl = settings.principalImageUrl; // If null, show placeholder icon

    return (
        <section className="bg-gradient-to-r from-blue-50 to-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden relative">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-100 rounded-full blur-3xl -ml-10 -mb-10 opacity-50"></div>

            <div className="container mx-auto px-6 py-10 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    {/* Image Section */}
                    <div className="flex-shrink-0 relative group">
                        <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white shadow-xl overflow-hidden relative z-10 transition-transform duration-500 group-hover:scale-105">
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={principalName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {/* Decorative Circle behind */}
                        <div className="absolute inset-0 bg-blue-600 rounded-full blur-md opacity-20 transform translate-y-4 scale-95 -z-0"></div>

                        {/* Title Badge */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg whitespace-nowrap">
                            Hiệu Trưởng
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2 font-display">
                            LỜI NGỎ CỦA BAN GIÁM HIỆU
                        </h2>
                        <div className="w-16 h-1 bg-yellow-400 mx-auto md:mx-0 mb-6 rounded-full"></div>

                        <div className="relative">
                            <svg className="absolute -top-4 -left-4 w-8 h-8 text-blue-200 transform -scale-x-100" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.0547 15.592 14.4793 17.5373 14.4793H19.9653L19.9653 12H17.5373C15.2347 12 13.568 10.3333 13.568 8.03067V2.5H21.5V11C21.5 16.5227 18.1507 21 14.017 21ZM5.51733 21L5.51733 18C5.51733 16.0547 7.092 14.4793 9.03733 14.4793H11.4653L11.4653 12H9.03733C6.73467 12 5.068 10.3333 5.068 8.03067V2.5H13V11C13 16.5227 9.65067 21 5.51733 21Z" /></svg>
                            <p className="text-gray-600 text-lg md:text-xl italic leading-relaxed px-6 py-2 relative z-10">
                                {message}
                            </p>
                            <svg className="absolute -bottom-4 -right-2 w-8 h-8 text-blue-200" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.0547 15.592 14.4793 17.5373 14.4793H19.9653L19.9653 12H17.5373C15.2347 12 13.568 10.3333 13.568 8.03067V2.5H21.5V11C21.5 16.5227 18.1507 21 14.017 21ZM5.51733 21L5.51733 18C5.51733 16.0547 7.092 14.4793 9.03733 14.4793H11.4653L11.4653 12H9.03733C6.73467 12 5.068 10.3333 5.068 8.03067V2.5H13V11C13 16.5227 9.65067 21 5.51733 21Z" /></svg>
                        </div>

                        <div className="mt-8 flex flex-col md:flex-row items-center justify-center md:justify-start gap-2">
                            <span className="font-bold text-gray-800 text-lg uppercase tracking-wide">
                                {principalName}
                            </span>
                            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                            <span className="text-blue-500 font-medium">Hiệu trưởng nhà trường</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
