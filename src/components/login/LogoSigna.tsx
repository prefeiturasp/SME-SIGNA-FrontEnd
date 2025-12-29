import Image from "next/image";
import LogoSignaImg from "@/assets/images/logo-signa.png"

export default function LogoGipe({ className = "", ...props }) {
    return (
        <Image
            src={LogoSignaImg}
            alt="Logo Signa"
            width={LogoSignaImg.width}
            height={LogoSignaImg.height}
            className={`object-contain ${className}`}
            priority
            {...props}
        />
    );
}
