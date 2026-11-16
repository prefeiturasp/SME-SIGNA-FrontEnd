import { Tag } from "antd";

const COR = "#1D5FA8";
const FUNDO = "rgba(29, 95, 168, 0.10)";

interface TagApostiladaProps {
  // Flag `apostilado` do backend: ato ativo com ao menos uma apostila válida.
  readonly apostilado?: boolean | null;
}

/** Flag "Apostilada" de designações e cessações alteradas por apostila. */
export default function TagApostilada({ apostilado }: TagApostiladaProps) {
  if (!apostilado) return null;

  return (
    <Tag
      className="rounded-full m-0 font-normal"
      style={{ color: COR, background: FUNDO, borderColor: "transparent" }}
    >
      Apostilada
    </Tag>
  );
}
