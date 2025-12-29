"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Logout from "@/assets/icons/Logout";
import { useUserStore } from "@/stores/useUserStore";

export default function SignOutButton() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const clearUser = useUserStore((state) => state.clearUser);

    const handleLogout = async () => {
        queryClient.removeQueries({ queryKey: ["me"] });
        await clearUser();
        router.push("/");
    };

    return (
        <Button
            onClick={handleLogout}
            variant="ghost"
            className="flex h-[80px] flex-col items-center text-xs"
            style={{ color: "#B22B2A" }}
        >
            <Logout width={28} height={28} />
            Sair
        </Button>
    );
}
