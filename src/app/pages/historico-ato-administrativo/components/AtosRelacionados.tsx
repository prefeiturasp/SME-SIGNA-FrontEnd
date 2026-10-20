"use client";

import Link from "next/link";
import { ChevronRight, FileText, LoaderCircle } from "lucide-react";

interface IAtosAdministrativosType {
    readonly id: number;
    readonly data: string;
    readonly portaria: string;
    readonly titulo: string;
    readonly descricao: string;
    readonly principal: boolean;
}

interface Props {
    readonly atos: IAtosAdministrativosType[];    
    readonly isLoading: boolean;
}

export default function AtosRelacionados({ atos = [], isLoading = false }: Props) {
    const atosVisiveis = atos.filter((ato) =>
        [ato.data, ato.portaria, ato.titulo, ato.descricao].some((valor) => valor?.trim())
    );

    const renderConteudo = () => {
        if (isLoading) {
            return (
                <output className="atos-relacionados-message">
                    <LoaderCircle className="motion-safe:animate-spin" size={20} aria-hidden="true" />
                    Carregando atos relacionados…
                </output>
            );
        }

        if (atosVisiveis.length === 0) {
            return (
                <div className="atos-relacionados-message">
                    <FileText size={22} aria-hidden="true" />
                    Nenhum ato relacionado encontrado.
                </div>
            );
        }

        return (
            <ol className="atos-relacionados-timeline">
                {atosVisiveis.map((ato) => (
                    <li key={ato.id} className="atos-relacionados-item" data-principal={ato.principal}>
                        <article className="atos-relacionados-row">
                            <dl className="atos-relacionados-metadata">
                                <div>
                                    {ato.data?.trim() && <><dt>Data do ato</dt><dd>{ato.data}</dd></>}
                                </div>
                                <div>
                                    {ato.portaria?.trim() && <><dt>Portaria</dt><dd>{ato.portaria}</dd></>}
                                </div>
                            </dl>
                            <div className="atos-relacionados-content">
                                <h3 className="atos-relacionados-title">{ato.titulo?.trim() || "Ato administrativo"}</h3>
                                {ato.descricao?.trim() && <p className="atos-relacionados-description">{ato.descricao}</p>}
                            </div>
                            <Link
                                href={`/pages/listagem-designacoes/visualizar-designacao/${ato.id}`}
                                className="atos-relacionados-details"
                                aria-label={`Ver detalhes de ${ato.titulo || "ato administrativo"}${ato.portaria ? `, portaria ${ato.portaria}` : ""}`}
                            >
                                Detalhes <ChevronRight size={16} aria-hidden="true" />
                            </Link>
                        </article>
                    </li>
                ))}
            </ol>
        );
    };

    return (
        <section className="atos-relacionados-section" aria-busy={isLoading}>
            <div className="atos-relacionados-header">
                <h2 className="atos-relacionados-heading">Atos relacionados</h2>
                {!isLoading && (
                    <span className="atos-relacionados-count">
                        {atosVisiveis.length} {atosVisiveis.length === 1 ? "registro" : "registros"}
                    </span>
                )}
            </div>

            {renderConteudo()}
        </section>
    );
}
