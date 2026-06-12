import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import {
  NotificationProvider,
  useAppNotification,
} from "./NotificationProvider";

const successMock = vi.fn();
const errorMock = vi.fn();
const warningMock = vi.fn();
const infoMock = vi.fn();

vi.mock("antd", () => ({
  notification: {
    useNotification: () => [
      {
        success: successMock,
        error: errorMock,
        warning: warningMock,
        info: infoMock,
      },
      <div key="notification-holder" data-testid="notification-context-holder" />,
    ],
  },
}));

function Consumer() {
  const notification = useAppNotification();

  return (
    <div>
      <button
        type="button"
        onClick={() => notification.success("Sucesso", "Tudo certo")}
      >
        success
      </button>
      <button
        type="button"
        onClick={() => notification.error("Erro", "Algo falhou")}
      >
        error
      </button>
      <button
        type="button"
        onClick={() => notification.warning("Aviso", "Atenção aqui")}
      >
        warning
      </button>
      <button
        type="button"
        onClick={() => notification.info("Info")}
      >
        info
      </button>
    </div>
  );
}

describe("NotificationProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza context holder e children", () => {
    render(
      <NotificationProvider>
        <div data-testid="child">Conteúdo</div>
      </NotificationProvider>
    );

    expect(
      screen.getByTestId("notification-context-holder")
    ).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("dispara métodos de notificação com props padrão", async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );

    await user.click(screen.getByRole("button", { name: /success/i }));
    expect(successMock).toHaveBeenCalledWith({
      message: "Sucesso",
      description: "Tudo certo",
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });

    await user.click(screen.getByRole("button", { name: /error/i }));
    expect(errorMock).toHaveBeenCalledWith({
      message: "Erro",
      description: "Algo falhou",
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });

    await user.click(screen.getByRole("button", { name: /warning/i }));
    expect(warningMock).toHaveBeenCalledWith({
      message: "Aviso",
      description: "Atenção aqui",
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });

    await user.click(screen.getByRole("button", { name: /info/i }));
    expect(infoMock).toHaveBeenCalledWith({
      message: "Info",
      description: undefined,
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });
  });
});
