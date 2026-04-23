"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";

// ─── Utilitários ─────────────────────────────────────────────────────────────

const PALAVRAS_FIXAS_PADRAO = [
    "EXPEDE:",
    "PORTARIA Nº",
    "SEI Nº",
    "R E S O L V E:",
    "FAZER CESSAR",
    "O Secretário Municipal de Educação",
];

export function normalizarQuebras(texto: string): string {
    return texto.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

export function gerarHtmlPortaria(
    texto: string,
    palavrasFixas: string[] = PALAVRAS_FIXAS_PADRAO
): string {
    if (!texto) return "";

    const textoLimpo = normalizarQuebras(texto);

    return textoLimpo
        .split("\n")
        .map((linha) => {
            if (!linha.trim()) return `<div><br></div>`;
            let l = linha;
            for (const palavra of palavrasFixas) {
                l = l.replaceAll(new RegExp(`(${palavra})`, "g"), "<strong>$1</strong>");
            }
            return `<div>${l}</div>`;
        })
        .join("");
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface EditorSEIHandle {
    getHtml: () => string;
    getTexto: () => string;
}

export interface EditorSEIProps {
    /** HTML já processado para exibir no editor */
    html: string;
    /** Rótulo exibido acima do editor */
    titulo?: string;
    /** Altura mínima do editor */
    minHeight?: string;
    /** Callback disparado a cada input do usuário no editor */
    onInput?: (e: React.FormEvent<HTMLDivElement>) => void;
    /** Exibe ou oculta o botão de ação */
    mostrarBotao?: boolean;
    /** Texto do botão */
    labelBotao?: string;
    /** Tipo do botão */
    tipoBotao?: "submit" | "button";
    /** Callback ao clicar no botão */
    onAcao?: () => void;
    /** data-testid do botão */
    testId?: string;
    /** Desabilita o botão */
    desabilitarBotao?: boolean;
}

// ─── Componente ──────────────────────────────────────────────────────────────

const EditorSEI = forwardRef<EditorSEIHandle, EditorSEIProps>(
    (
        {
            html,
            titulo = "PORTARIA",
            minHeight = "350px",
            onInput,
            mostrarBotao = true,
            labelBotao = "Salvar",
            tipoBotao = "submit",
            onAcao,
            testId = "botao-acao-editor",
            desabilitarBotao = false,
        },
        ref
    ) => {
        const editorRef = useRef<HTMLDivElement | null>(null);

        // Injeta o HTML sempre que mudar
        useEffect(() => {
            if (editorRef.current && html) {
                editorRef.current.innerHTML = html;
            }
        }, [html]);

        // Expõe métodos ao pai
        useImperativeHandle(ref, () => ({
            getHtml: () => editorRef.current?.innerHTML ?? "",
            getTexto: () => editorRef.current?.innerText ?? "",
        }));

        return (
            <div className="flex flex-col gap-4 mt-4">
                {/* Título */}
                <span className="text-sm font-semibold text-[#333] uppercase tracking-wide">
                    {titulo}
                </span>

                {/* Editor */}
                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={onInput}
                    style={{ minHeight }}
                    className="w-full border border-gray-300 rounded p-4 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 leading-relaxed overflow-auto"
                />

                {/* Botão opcional */}
                {mostrarBotao && (
                    <div className="w-full flex justify-end pt-[2rem]">
                        <div className="w-[200px]">
                            <Button
                                type={tipoBotao}
                                size="lg"
                                className="w-full flex items-center justify-center gap-6"
                                variant="destructive"
                                data-testid={testId}
                                onClick={onAcao}
                                disabled={desabilitarBotao}
                            >
                                <p className="text-[16px] font-bold">{labelBotao}</p>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

EditorSEI.displayName = "EditorSEI";

export default EditorSEI;