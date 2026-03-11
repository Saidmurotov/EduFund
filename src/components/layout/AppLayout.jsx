import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";

export default function AppLayout({ children }) {
    return (
        <div className="flex bg-[#0F172A] min-h-screen text-slate-100">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
                    {children}
                </div>
            </main>

            {/* Mobile BottomNav */}
            <div className="lg:hidden">
                <BottomNav />
            </div>
        </div>
    );
}
