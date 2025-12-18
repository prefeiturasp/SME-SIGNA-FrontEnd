import LogoGipe from "@/components/login/LogoGipe";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Finalizado() {
    return (
        <div className="min-h-[80vh] flex flex-col justify-between items-center w-full max-w-md mx-auto px-4 py-8">
            <div className="w-full flex flex-col items-center">
                <div className="flex mb-6 mt-2 w-full">
                    <LogoGipe className="w-48" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3 w-full">
                    Solicitação de acesso enviada!
                </h1>
                <p className="text-sm text-gray-600 w-full">
                    Em breve, você será notificado pelo e-mail cadastrado com as
                    próximas instruções.
                    <br />
                    Fique atento à sua caixa de entrada e lixo eletrônico.
                </p>
            </div>
            <div className="w-full flex flex-col items-center mt-8">
                <Button
                    variant="secondary"
                    className="w-full text-center rounded-md text-[16px] font-[700] md:h-[45px] bg-[#717FC7] text-white hover:bg-[#5a65a8]"
                    asChild
                >
                    <Link href="/" replace>
                        Finalizar
                    </Link>
                </Button>
            </div>
        </div>
    );
}
