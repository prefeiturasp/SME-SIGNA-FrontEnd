import Image from "next/image";
import LogoGipeImg from "@/assets/images/logo-signa.webp"

export default function LogoSigna({ className = "", ...props }) {
    const logoWidth = (LogoGipeImg as { width?: number }).width ?? 200;
    const logoHeight = (LogoGipeImg as { height?: number }).height ?? 80;

    return (
        <Image
            src={LogoGipeImg}
            alt="Logo SIGNA"
            width={logoWidth}
            height={logoHeight}
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
