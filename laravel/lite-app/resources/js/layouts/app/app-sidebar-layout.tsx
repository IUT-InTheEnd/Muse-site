import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

import type { AppLayoutProps } from '@/types';
import Navbar from '@/components/musecomponents/Navbar';
import Footer from '@/components/musecomponents/Footer';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {

    const { auth } = usePage<SharedData>().props;
    
    return (
        <AppShell variant="sidebar">
            <AppSidebar />

            <AppContent variant="sidebar" className="overflow-x-hidden flex flex-col min-h-screen">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />

                <header className="w-full shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <div className="mx-auto w-full max-w-[675px] lg:max-w-4xl text-sm">
                        <Navbar user={auth.user}/>
                    </div>
                </header>

                <main className="flex-1">
                    {children}
                </main>
                
                {!auth.user && (
                    <footer className="w-full shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                        <div className="mx-auto w-full max-w-[675px] lg:max-w-4xl py-6 text-sm">
                            <Footer />
                        </div>
                    </footer>
                )}
                
            </AppContent>
        </AppShell>
    );
}
