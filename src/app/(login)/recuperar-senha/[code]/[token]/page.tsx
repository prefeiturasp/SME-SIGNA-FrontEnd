import FormAlterarSenha from "@/components/login/FormAlterarSenha";

export default async function Page({
    params,
}: {
    readonly params: Promise<{ readonly token: string; readonly code: string }>;
}) {
    const { token, code } = await params;
    const decodedToken = decodeURIComponent(token);
    const decodedCode = decodeURIComponent(code);

    return <FormAlterarSenha code={decodedCode} token={decodedToken} />;
}
