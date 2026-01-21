import ConfirmarEmail from "@/components/dashboard/MeusDados/ConfirmarEmail";

export default async function Page({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = await params;

    const decodedCode = decodeURIComponent(code);

    return <ConfirmarEmail code={decodedCode} />;
}
