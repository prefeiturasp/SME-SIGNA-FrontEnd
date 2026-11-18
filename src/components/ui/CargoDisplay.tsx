
import { cn } from "@/lib/utils";

interface CargoDisplayProps {
  codigoCargo?: string | number | null;
  descricaoCompleta?: string | null;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  "data-testid"?: string;
}

 
export function CargoDisplay({
  codigoCargo,
  descricaoCompleta,
  isLoading = false,
  loadingText = "Carregando cargo...",
  className,
  "data-testid": dataTestId = "cargo-painel",
}: Readonly<CargoDisplayProps>) {
  const codigo = codigoCargo ? String(codigoCargo) : "-";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-[#F1F5F9] px-[8px] py-[4px]",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[14px] font-normal text-[#313131]">Cargo:</span>
        <span className="text-[14px] truncate font-bold" data-testid={dataTestId}>
          {isLoading
            ? loadingText
            : `${codigo}${descricaoCompleta ? ` - ${descricaoCompleta}` : ""}`}
        </span>
      </div> 
    </div>
  );
}

export default CargoDisplay;
