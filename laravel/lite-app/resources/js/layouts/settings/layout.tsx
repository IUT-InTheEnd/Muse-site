import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editPrivacy } from '@/routes/privacy';
import { edit } from '@/routes/profile';
import { show as showSecurity } from '@/routes/security';
import type { NavItem, User } from '@/types';

type SettingsNavItem = NavItem & {
    visibleWhenGuest: boolean;
};

const sidebarNavItems: SettingsNavItem[] = [
    {
        title: 'Profil',
        href: edit(),
        icon: null,
        visibleWhenGuest: false,
    },
    {
        title: 'Sécurité',
        href: showSecurity(),
        icon: null,
        visibleWhenGuest: false,
    },
    {
        title: 'Confidentialité',
        href: editPrivacy(),
        icon: null,
        visibleWhenGuest: false,
    },
    {
        title: 'Apparence',
        href: editAppearance(),
        icon: null,
        visibleWhenGuest: true,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();
    const page = usePage<{ auth?: { user?: User | null } }>();
    const user = page.props.auth?.user ?? null;
    const visibleNavItems = user
        ? sidebarNavItems
        : sidebarNavItems.filter((item) => item.visibleWhenGuest);

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <Heading
                title="Paramètres"
                description={
                    user
                        ? 'Gérez votre profil, votre sécurité et vos préférences.'
                        : "Gérez l'apparence du site sur cet appareil."
                }
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Paramètres"
                    >
                        {visibleNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start cursor-pointer', {
                                    'bg-muted': isCurrentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1">
                    <section className="space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
