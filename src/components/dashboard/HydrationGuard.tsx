"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
    return () => {};
}

function getSnapshot() {
    return true;
}

function getServerSnapshot() {
    return false;
}

export function HydrationGuard({ children }: { children: React.ReactNode }) {
    const isHydrated = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    if (!isHydrated) return null;

    return <>{children}</>;
}
