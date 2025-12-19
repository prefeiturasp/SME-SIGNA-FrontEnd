import Image from "next/image";
import LogoGipeImg from "@/assets/images/logo-signa.webp"

export default function LogoSigna({ className = "", ...props }) {
    return (
        <Image
            src={LogoGipeImg}
            alt="Logo SIGNA"
            width={LogoGipeImg.width}
            height={LogoGipeImg.height}
            className={`object-contain ${className}`}
            priority
            {...props}
        />
    );
}
