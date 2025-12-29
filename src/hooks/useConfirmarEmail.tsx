import { useMutation } from "@tanstack/react-query";
import { confirmarEmailAction } from "@/actions/confirmar-email";
import { useUserStore } from "@/stores/useUserStore";

const useConfirmarEmail = () => {
    const setUser = useUserStore((state) => state.setUser);
    return useMutation({
        mutationFn: confirmarEmailAction,
        onSuccess: (response) => {
            if (!response.success || !response.new_mail) return;

            const email = response.new_mail;

            const currentUser = useUserStore.getState().user;
            if (!currentUser) return;

            setUser({
                ...currentUser,
                email,
            });
        },
    });
};

export default useConfirmarEmail;
