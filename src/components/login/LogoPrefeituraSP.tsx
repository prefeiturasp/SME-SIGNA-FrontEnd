import Image from "next/image";
import LogoPrefeituraSPImage from "@/assets/images/logo-prefeitura-sp.webp"

export default function LogoPrefeituraSP({ className = "", ...props }) {
    return (
        <Image
            src={LogoPrefeituraSPImage}
            alt="Logo prefeitura de SP"
            width={LogoPrefeituraSPImage.width}
            height={LogoPrefeituraSPImage.height}
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
