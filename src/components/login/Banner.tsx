import Image from "next/image";
import BannerForms from "@/assets/images/banner.webp";

export default function Banner() {
    return (
        <div className="w-full h-full relative overflow-hidden">
            <Image
                src={BannerForms}
                alt="Banner do login"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                priority
            />
        </div>
    );
}
