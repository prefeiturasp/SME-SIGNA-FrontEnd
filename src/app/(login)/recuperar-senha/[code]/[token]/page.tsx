import FormAlterarSenha from "@/components/login/FormAlterarSenha";

export default function Page({
    params,
}: {
    readonly params: { readonly code: string; readonly token: string };
}) {
    const code = decodeURIComponent(params.code);
    const token = decodeURIComponent(params.token);

    return <FormAlterarSenha code={code} token={token} />;
}
