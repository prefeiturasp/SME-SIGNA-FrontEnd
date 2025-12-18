import Image from "next/image";
import LogoGipeImg from "@/assets/images/logo-gipe.webp"

export default function LogoGipe({ className = "", ...props }) {
    return (
        <Image
            src={LogoGipeImg}
            alt="Logo GIPE"
            width={LogoGipeImg.width}
            height={LogoGipeImg.height}
            className={`object-contain ${className}`}
            priority
            {...props}
        />
    );
}
