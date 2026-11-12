"use client";

import { useMemo, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Loader2 } from "lucide-react";

import { useUnidadesCadastradas } from "@/hooks/useUnidadesCadastradas";
import { UnidadeCadastrada } from "@/types/designacao-unidade";

const LIMITE_RESULTADOS = 50;

// Remove acentos caractere a caractere, mantendo o mesmo tamanho do texto
// original para que os índices do destaque continuem válidos.
const normalizar = (texto: string) =>
  Array.from(texto)
    .map((c) => c.normalize("NFD").replaceAll(/\p{M}/gu, "").charAt(0) || c)
    .join("")
    .toLowerCase();

function Destaque({ texto, busca }: Readonly<{ texto: string; busca: string }>) {
  const inicio = normalizar(texto).indexOf(normalizar(busca));
  if (!busca || inicio < 0) return <>{texto}</>;

  const fim = inicio + busca.length;
  return (
    <>
      {texto.slice(0, inicio)}
      <strong>{texto.slice(inicio, fim)}</strong>
      {texto.slice(fim)}
    </>
  );
}

interface AutocompleteUnidadeCadastradaProps {
  value: UnidadeCadastrada | null;
  onChange: (unidade: UnidadeCadastrada | null) => void;
}

export default function AutocompleteUnidadeCadastrada({
  value,
  onChange,
}: Readonly<AutocompleteUnidadeCadastradaProps>) {
  const { data: unidades = [], isLoading, isError } = useUnidadesCadastradas();
  const [busca, setBusca] = useState(value?.ue_nome ?? "");
  const [aberto, setAberto] = useState(false);

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return [];
    return unidades
      .filter((unidade) => normalizar(unidade.ue_nome).includes(termo))
      .slice(0, LIMITE_RESULTADOS);
  }, [unidades, busca]);

  const handleBusca = (texto: string) => {
    setBusca(texto);
    setAberto(true);
    if (value) onChange(null);
  };

  const handleSelecionar = (unidade: UnidadeCadastrada) => {
    onChange(unidade);
    setBusca(unidade.ue_nome);
    setAberto(false);
  };

  const mostrarLista = aberto && busca.trim() !== "" && !value;

  return (
    <div className="flex flex-col gap-2">
      {/* O cmdk define id e aria-labelledby do input; o rótulo acessível vem da prop label. */}
      <span aria-hidden="true" className="text-[14px] font-bold text-[#313131]">
        Unidade Proponente
      </span>
      <CommandPrimitive shouldFilter={false} className="relative" label="Unidade Proponente">
        <CommandPrimitive.Input
          value={busca}
          onValueChange={handleBusca}
          onFocus={() => setAberto(true)}
          onBlur={() => setAberto(false)}
          placeholder="Digite o nome da unidade"
          data-testid="input-busca-unidade-cadastrada"
          className="flex h-10 w-full rounded-[4px] border border-[#dadada] bg-background px-3 py-2 text-sm outline-hidden focus:border-[#B22B2A]"
        />
        {mostrarLista && (
          <CommandPrimitive.List className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[200px] overflow-y-auto rounded-[4px] bg-white shadow-md">
            {isLoading && (
              <CommandPrimitive.Loading>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#9CA3B9]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando unidades...
                </div>
              </CommandPrimitive.Loading>
            )}
            {!isLoading && (
              <CommandPrimitive.Empty className="px-3 py-2 text-sm text-[#9CA3B9]">
                {isError
                  ? "Não foi possível carregar as unidades."
                  : "Nenhuma unidade encontrada."}
              </CommandPrimitive.Empty>
            )}
            {filtradas.map((unidade) => (
              <CommandPrimitive.Item
                key={`${unidade.dre}-${unidade.ue}`}
                value={`${unidade.dre}-${unidade.ue}`}
                onSelect={() => handleSelecionar(unidade)}
                // Evita o blur do input antes do clique ser registrado.
                onMouseDown={(e) => e.preventDefault()}
                data-testid={`opcao-unidade-${unidade.ue}`}
                className="cursor-pointer px-3 py-2 text-sm text-[#313131] data-[selected=true]:bg-[#F5F5F5]"
              >
                <Destaque texto={unidade.ue_nome} busca={busca.trim()} />
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        )}
      </CommandPrimitive>
    </div>
  );
}
