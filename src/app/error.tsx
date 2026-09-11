"use client";

import { useEffect } from "react";
import { Result } from "antd";

export default function ErrorPage({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Result
                status="error"
                title="Ocorreu um erro!"
                subTitle="Não foi possível carregar esta página. Por favor, tente novamente."
                extra={[
                    <button
                        key="tentar-novamente"
                        onClick={() => reset()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Tentar novamente
                    </button>,
                ]}
            />
        </div>
    );
}
