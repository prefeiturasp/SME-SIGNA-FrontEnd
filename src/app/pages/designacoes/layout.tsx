import { DesignacaoProvider } from "./DesignacaoContext";

export default function DesignacoesLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <DesignacaoProvider>{children}</DesignacaoProvider>;
}

