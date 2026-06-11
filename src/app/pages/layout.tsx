import { SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "@/components/dashboard/Navbar/Navbar";
import { HydrationGuard } from "@/components/dashboard/HydrationGuard";
import AuthGuard from "@/components/providers/AuthGuard";
import { AppNewSidebar } from "@/components/dashboard/Sidebar/app-new-sidebar";
import { Layout } from "antd";
import { NotificationProvider } from "@/components/providers/NotificationProvider";

export default function DashboardLayout({
    children,
}: {
    readonly children: React.ReactNode;
}) {
    return (
        <HydrationGuard>
            <Layout hasSider style={{ minHeight: '100vh' }}>
                <SidebarProvider>
                    <AppNewSidebar />
                    <div className="flex flex-col flex-1 w-full ml-[105px]">
                    <NotificationProvider>                        
                        <AuthGuard>
                            <div className="flex min-h-screen flex-col">
                                <Navbar />

                                <main className="flex-grow bg-muted p-4 px-8">
                                    {children}
                                </main>

                                <footer className="h-[60px] p-4 text-sm text-[#313131]">
                                    Sistema homologado para navegadores: Google
                                    Chrome e Firefox
                                </footer>
                            </div>
                        </AuthGuard>
                        </NotificationProvider>
                    </div>
                </SidebarProvider>
            </Layout>
        </HydrationGuard>
    );
}
