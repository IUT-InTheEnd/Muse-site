import * as React from 'react';
import { cn } from '@/lib/utils';

type SlideFromBottomProps = {
    show: boolean;
    className?: string;
    openClassName?: string;
    closedClassName?: string;
    children: React.ReactNode;
    ariaHiddenWhenClosed?: boolean;
    innerRef?: React.Ref<HTMLDivElement>;
};

export default function SlideFromBottom({
    show,
    className,
    openClassName = 'translate-y-0',
    closedClassName = 'translate-y-full',
    children,
    ariaHiddenWhenClosed = false,
    innerRef,
}: SlideFromBottomProps) {
    return (
        <div
            ref={innerRef}
            className={cn(
                'transition-transform duration-300 ease-in-out',
                show ? openClassName : closedClassName,
                className,
            )}
            aria-hidden={ariaHiddenWhenClosed ? !show : undefined}
        >
            {children}
        </div>
    );
}
