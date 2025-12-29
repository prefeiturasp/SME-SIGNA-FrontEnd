import { Loader2 } from "lucide-react";

const FullPageLoader = () => {
    return (
        <div
            className="
                fixed inset-0 z-50  // Cobre a tela inteira e fica acima de tudo (z-index: 50)
                flex items-center justify-center // Centraliza o conteúdo (o spinner)
                bg-background/80 backdrop-blur-sm // Fundo semi-transparente com desfoque
            "
        >
            <Loader2
                className="
                    h-16 w-16 text-primary // Tamanho e cor do spinner (usa a cor primária do seu tema)
                    animate-spin // A classe mágica que faz o ícone girar
                "
            />
        </div>
    );
};

export default FullPageLoader;
