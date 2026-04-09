import * as React from 'react';
import { Head as InertiaHead } from '@inertiajs/react';

type Props = React.ComponentProps<typeof InertiaHead> & {
    description?: string;
};

export function Head({ description, children, ...props }: Props) {
    return (
        <InertiaHead {...props}>
            {description ? (
                <meta
                    head-key="description"
                    name="description"
                    content={description}
                />
            ) : null}
            {children}
        </InertiaHead>
    );
}
