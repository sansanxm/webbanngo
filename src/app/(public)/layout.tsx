import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhoneButton from "@/components/PhoneButton";
import AIAssistant from "@/components/AIAssistant";
import ZaloButton from "@/components/ZaloButton";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
            <AIAssistant />
            <PhoneButton />
            <ZaloButton />
        </div>
    );
}
