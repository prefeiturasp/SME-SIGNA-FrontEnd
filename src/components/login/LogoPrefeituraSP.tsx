import Image from "next/image";
import LogoPrefeituraSPImage from "@/assets/images/logo-prefeitura-sp.webp"

export default function LogoPrefeituraSP({ className = "", ...props }) {
    const logoWidth =
        (LogoPrefeituraSPImage as { width?: number }).width ?? 149;
    const logoHeight =
        (LogoPrefeituraSPImage as { height?: number }).height ?? 47;

    return (
        <Image
            src={LogoPrefeituraSPImage}
            alt="Logo prefeitura de SP"
            width={logoWidth}
            height={logoHeight}
            className={`object-contain mx-auto block ${className}`}
            {...props}
        />
    );
}
