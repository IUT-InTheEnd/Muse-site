import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';

export type ReactionType = 'like' | 'dislike' | null;
export type ReactionResource = 'tracks' | 'albums';

export type ReactionState = {
    reaction: ReactionType;
    likes: number;
    dislikes: number;
    pending: boolean;
    requestVersion: number;
};

type ReactionStore = Record<string, ReactionState>;

type ReactionSnapshot = Omit<ReactionState, 'pending' | 'requestVersion'>;

type ReactionContextValue = {
    getReaction: (
        resource: ReactionResource,
        resourceId: number,
    ) => ReactionState | null;
    seedReaction: (
        resource: ReactionResource,
        resourceId: number,
        state: ReactionSnapshot,
    ) => void;
    startRequest: (
        resource: ReactionResource,
        resourceId: number,
    ) => number;
    finishRequest: (
        resource: ReactionResource,
        resourceId: number,
        requestVersion: number,
        state: ReactionSnapshot,
    ) => void;
    failRequest: (
        resource: ReactionResource,
        resourceId: number,
        requestVersion: number,
    ) => void;
};

const ReactionContext = createContext<ReactionContextValue | null>(null);

function reactionKey(resource: ReactionResource, resourceId: number): string {
    return `${resource}:${resourceId}`;
}

function emptyReactionState(): ReactionState {
    return {
        reaction: null,
        likes: 0,
        dislikes: 0,
        pending: false,
        requestVersion: 0,
    };
}

export function ReactionProvider({ children }: { children: ReactNode }) {
    const [store, setStore] = useState<ReactionStore>({});
    const requestCounterRef = useRef(0);

    const getReaction = useCallback(
        (resource: ReactionResource, resourceId: number) =>
            store[reactionKey(resource, resourceId)] ?? null,
        [store],
    );

    const seedReaction = useCallback(
        (
            resource: ReactionResource,
            resourceId: number,
            state: ReactionSnapshot,
        ) => {
            setStore((current) => {
                const key = reactionKey(resource, resourceId);

                if (current[key]) {
                    return current;
                }

                return {
                    ...current,
                    [key]: {
                        ...state,
                        pending: false,
                        requestVersion: 0,
                    },
                };
            });
        },
        [],
    );

    const startRequest = useCallback(
        (resource: ReactionResource, resourceId: number) => {
            const key = reactionKey(resource, resourceId);
            const nextVersion = ++requestCounterRef.current;

            setStore((current) => {
                const existing = current[key] ?? emptyReactionState();

                return {
                    ...current,
                    [key]: {
                        ...existing,
                        pending: true,
                        requestVersion: nextVersion,
                    },
                };
            });

            return nextVersion;
        },
        [],
    );

    const finishRequest = useCallback(
        (
            resource: ReactionResource,
            resourceId: number,
            requestVersion: number,
            state: ReactionSnapshot,
        ) => {
            const key = reactionKey(resource, resourceId);

            setStore((current) => {
                const existing = current[key];

                if (!existing || existing.requestVersion !== requestVersion) {
                    return current;
                }

                return {
                    ...current,
                    [key]: {
                        ...state,
                        pending: false,
                        requestVersion,
                    },
                };
            });
        },
        [],
    );

    const failRequest = useCallback(
        (
            resource: ReactionResource,
            resourceId: number,
            requestVersion: number,
        ) => {
            const key = reactionKey(resource, resourceId);

            setStore((current) => {
                const existing = current[key];

                if (!existing || existing.requestVersion !== requestVersion) {
                    return current;
                }

                return {
                    ...current,
                    [key]: {
                        ...existing,
                        pending: false,
                    },
                };
            });
        },
        [],
    );

    const value = useMemo<ReactionContextValue>(
        () => ({
            getReaction,
            seedReaction,
            startRequest,
            finishRequest,
            failRequest,
        }),
        [getReaction, seedReaction, startRequest, finishRequest, failRequest],
    );

    return (
        <ReactionContext.Provider value={value}>
            {children}
        </ReactionContext.Provider>
    );
}

export function useReactionContext(): ReactionContextValue {
    const context = useContext(ReactionContext);

    if (context === null) {
        throw new Error(
            'useReactionContext must be used inside ReactionProvider',
        );
    }

    return context;
}
