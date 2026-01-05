import Image from "next/image";
import LogoSignaImg from "@/assets/images/logo-signa.webp"

export default function LogoSigna({ className = "", ...props }) {
    const logoWidth = (LogoSignaImg as { width?: number }).width ?? 200;
    const logoHeight = (LogoSignaImg as { height?: number }).height ?? 80;

    return (
        <Image
            src={LogoSignaImg}
            alt="Logo SIGNA"
            width={logoWidth}
            height={logoHeight}
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
