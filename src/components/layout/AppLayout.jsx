import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";

export default function AppLayout({ children }) {
    return (
        <div className="flex bg-[#0F172A] min-h-screen text-slate-100 overflow-x-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-[16rem] fixed h-full">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-[16rem] pb-[5rem] lg:pb-0 min-h-screen">
                <div className="max-w-[1440px] mx-auto px-[1rem] py-[1.5rem] lg:px-[2rem] lg:py-[2rem]">
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
