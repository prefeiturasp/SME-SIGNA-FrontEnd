import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/Sidebar/app-sidebar";
import { Navbar } from "@/components/dashboard/Navbar/Navbar";
import { HydrationGuard } from "@/components/dashboard/HydrationGuard";
import AuthGuard from "@/components/providers/AuthGuard";

export default function DashboardLayout({
    children,
}: {
    readonly children: React.ReactNode;
}) {
    return (
        <HydrationGuard>
            <div className="flex min-h-screen">
                <SidebarProvider>
                    <AppSidebar />
                    <div className="flex flex-col flex-1 w-full">
                        <AuthGuard>
                            <Navbar />
                            <main className="flex-1 bg-muted p-4">
                                {children}
                                <footer className="p-4 text-sm text-[#42474a]">
                                    Sistema homologado para navegadores: Google
                                    Chrome e Firefox
                                </footer>
                            </main>
                        </AuthGuard>
                    </div>
                </SidebarProvider>
            </div>
        </HydrationGuard>
    );
}
