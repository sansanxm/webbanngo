"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useSettings } from "@/context/SettingsContext";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface SiteKnowledge {
    recentNews: string[];
    recentBulletins: string[];
    recentDocs: string[];
    recentResources: string[];
}

export default function AIAssistant() {
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [siteKnowledge, setSiteKnowledge] = useState<SiteKnowledge>({
        recentNews: [],
        recentBulletins: [],
        recentDocs: [],
        recentResources: []
    });
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Initial greeting and Knowledge fetching
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    role: "assistant",
                    content: "Xin chào! Tôi là Trợ lý AI của Trường Bản Ngò. Tôi đã sẵn sàng hỗ trợ bạn tìm hiểu thông tin về các hoạt động, văn bản và tài nguyên của nhà trường. Bạn cần giúp gì không ạ?"
                }
            ]);
        }

        const fetchGlobalKnowledge = async () => {
            try {
                const getItems = async (colName: string, titleField: string = "title") => {
                    const q = query(collection(db, colName), orderBy("date", "desc"), limit(10));
                    const snap = await getDocs(q);
                    return snap.docs.map(doc => doc.data()[titleField]);
                };

                const [news, bulletins, docs, resources] = await Promise.all([
                    getItems("posts"),
                    getItems("bulletins"),
                    getItems("documents"),
                    getItems("resources")
                ]);

                setSiteKnowledge({
                    recentNews: news,
                    recentBulletins: bulletins,
                    recentDocs: docs,
                    recentResources: resources
                });
            } catch (err) {
                console.error("Knowledge fetch error:", err);
            }
        };

        fetchGlobalKnowledge();
    }, []);

    const getPageContext = () => {
        const main = document.querySelector("main");
        if (main) {
            const temp = main.cloneNode(true) as HTMLElement;
            const toRemove = temp.querySelectorAll("script, style, nav, footer, button");
            toRemove.forEach(el => el.remove());
            return temp.innerText.substring(0, 4000);
        }
        return document.body.innerText.substring(0, 2000);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const apiKey = settings.geminiApiKey;
            if (!apiKey) {
                setMessages(prev => [...prev, {
                    role: "assistant",
                    content: "⚠️ Trợ lý AI hiện đang nghỉ ngơi (chưa có API Key). Quản trị viên vui lòng cấu hình trong trang Cài đặt nhé ạ."
                }]);
                setIsLoading(false);
                return;
            }

            const genAI = new GoogleGenerativeAI(apiKey);

            const pageTitle = document.title;
            const context = getPageContext();

            // Format global knowledge for prompt
            const siteKnowledgeText = `
DỮ LIỆU TỔNG QUAN WEBSITE:
- Tin tức mới nhất: ${siteKnowledge.recentNews.join(", ")}
- Hoạt động mới nhất: ${siteKnowledge.recentBulletins.join(", ")}
- Văn bản mới nhất: ${siteKnowledge.recentDocs.join(", ")}
- Tài nguyên/Phần mềm mới: ${siteKnowledge.recentResources.join(", ")}

THÔNG TIN TRƯỜNG:
- Tên trường: ${settings.schoolName || "Trường PTDTBT Tiểu học Bản Ngò"}
- Hiệu trưởng: ${settings.principalName || "Cô Nông Thị Lượng"}
- Phó Hiệu trưởng: ${settings.vicePrincipalName || "Cô Phạm Thị Ngân Thuỷ"}
- Địa chỉ: ${settings.address || "Thôn Táo Thượng, xã Pà Vầy Sủ, huyện Xín Mần, tỉnh Hà Giang (hoặc Tuyên Quang theo cập nhật)"}
- Điện thoại: ${settings.phone || "097.1986.343"}
- Email: ${settings.email || "c1bngo.xinman@hagiang.edu.vn"}

GIỚI THIỆU CHI TIẾT:
- Lịch sử: Thành lập năm 1941. Năm 2016 đạt chuẩn Quốc gia mức độ I. Năm 2017 đổi tên thành trường PTDTBT (Phổ thông dân tộc bán trú).
- Tầm nhìn: Trở thành trường chuẩn quốc gia mức độ 2, là điểm sáng giáo dục vùng cao.
- Sứ mệnh: Tạo môi trường học tập an toàn, thân thiện, giúp học sinh phát triển toàn diện.
- Quy mô: Năm học 2025-2026 có 34 cán bộ, giáo viên, nhân viên tâm huyết cùng với 412 học sinh đang theo học tại trường.
`;

            const systemInstruction = `
Bạn là một trợ lý AI chuyên nghiệp và thân thiện của "Trường PTDTBT Tiểu học Bản Ngò".
Nhiệm vụ của bạn là hỗ trợ phụ huynh, học sinh và giáo viên giải đáp các thắc mắc (1) về trường và (2) về kiến thức giáo dục phổ thông.

${siteKnowledgeText}

NGỮ CẢNH TRANG HIỆN TẠI (Người dùng đang xem trang này):
- Tiêu đề trang: ${pageTitle}
- Nội dung tóm tắt: ${context}

Hướng dẫn trả lời:
1. LUÔN ƯU TIÊN dữ liệu nội bộ của trường trước. Nếu có thông tin trong "DỮ LIỆU TỔNG QUAN WEBSITE" hoặc "THÔNG TIN TRƯỜNG", hãy dùng nó.
2. NẾU CÂU HỎI NGOÀI DỮ LIỆU TRƯỜNG: Về thông tư, quy định của Bộ GD&ĐT, hoặc kiến thức sư phạm (Toán, Tiếng Việt...), hãy DÙNG KIẾN THỨC CỦA BẠN/TÌM KIẾM WEB để trả lời chính xác và dễ hiểu.
3. TỪ CHỐI các câu hỏi không liên quan đến giáo dục, sư phạm, hoặc trường học (ví dụ: chứng khoán, chính trị, y tế phức tạp, giải trí...). Hãy lịch sự nói rằng bạn chỉ hỗ trợ lĩnh vực giáo dục.
4. Trả lời lịch sự, thân thiện, dùng ngôn ngữ phù hợp môi trường sư phạm tiểu học vùng cao. Giữ câu trả lời súc tích.
`;

            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash", // Cập nhật sang bản 2.5-flash mới nhất
                systemInstruction: systemInstruction,
                tools: [
                    { googleSearch: {} } as any
                ]
            });

            // Prepare history (Gemini requires the first message in history to be from the 'user')
            const chatHistory = messages
                .map(m => ({
                    role: m.role === "user" ? "user" : "model" as "user" | "model",
                    parts: [{ text: m.content }],
                }))
                .filter((msg, idx, arr) => {
                    const firstUserIndex = arr.findIndex(m => m.role === 'user');
                    return firstUserIndex !== -1 && idx >= firstUserIndex;
                });

            const chat = model.startChat({
                history: chatHistory,
            });

            const result = await chat.sendMessage(userMsg);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, { role: "assistant", content: text }]);
        } catch (error: any) {
            console.error("AI Chat Error:", error);
            const errorMsg = error?.message || "Lỗi không xác định";
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `⚠️ Có lỗi xảy ra: ${errorMsg.substring(0, 100)}${errorMsg.length > 100 ? "..." : ""}. Vui lòng kiểm tra lại API Key hoặc kết nối mạng.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button (Symmetric with PhoneButton) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="fixed bottom-[92px] right-6 z-50 pointer-events-none md:pointer-events-auto"
            >
                <div
                    className="pointer-events-auto flex items-center group cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {/* Shake & Pulse Container */}
                    <div className="relative">
                        {/* Pulsing rings (Only when closed) */}
                        {!isOpen && (
                            <>
                                <motion.div
                                    className="absolute inset-0 bg-blue-400 rounded-full z-0"
                                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                />
                                <motion.div
                                    className="absolute inset-0 bg-blue-400 rounded-full z-0"
                                    animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                />
                            </>
                        )}

                        {/* Shaking Icon Circle */}
                        <motion.div
                            className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors duration-500 ${isOpen ? "bg-red-500" : "bg-gradient-to-br from-blue-600 to-indigo-700"
                                }`}
                            animate={!isOpen ? { rotate: [0, -10, 10, -10, 10, 0] } : { rotate: 90 }}
                            transition={!isOpen ? { duration: 0.5, repeat: Infinity, repeatDelay: 2 } : { duration: 0.5 }}
                        >
                            {isOpen ? (
                                <svg className="w-8 h-8 text-white rotate-[-90deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <div className="relative">
                                    <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </motion.div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        className="fixed bottom-[180px] right-6 w-[calc(100vw-3rem)] sm:w-[400px] max-h-[600px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-50 flex flex-col overflow-hidden border border-blue-50 ring-8 ring-blue-50/30"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/30 text-2xl">
                                    🎓
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tight text-lg">Trợ lý AI</h3>
                                    <div className="flex items-center gap-2 text-xs text-blue-100 font-bold">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        Đang trực tuyến
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 scroll-smooth"
                            style={{ scrollbarWidth: 'thin' }}
                        >
                            {messages.map((msg, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-3xl font-medium text-sm shadow-sm ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-gray-100 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-gray-100">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Nhập câu hỏi của bạn..."
                                    className="flex-1 bg-gray-100/80 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-14"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:bg-gray-400 hover:scale-105 transition-all"
                                >
                                    <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
