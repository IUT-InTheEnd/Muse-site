import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';
import Navbar from '@/components/musecomponents/Navbar';
import Footer from '@/components/musecomponents/Footer';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />

            <AppContent variant="sidebar" className="overflow-x-hidden flex flex-col min-h-screen">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />

                <Navbar />

                <main className="flex-1">
                    {children}
                </main>
                
                <Footer />
            </AppContent>
        </AppShell>
    );
}
