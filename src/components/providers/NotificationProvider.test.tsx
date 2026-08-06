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
const destroyMock = vi.fn();

vi.mock("antd", () => ({
  notification: {
    useNotification: () => [
      {
        success: successMock,
        error: errorMock,
        warning: warningMock,
        info: infoMock,
        destroy: destroyMock,
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
        onClick={() =>
          notification.success({
            title: "Sucesso",
            description: "Tudo certo",
          })
        }
      >
        success
      </button>
      <button
        type="button"
        onClick={() =>
          notification.success({
            title: "Sucesso com limpeza",
            clearPrevious: true,
          })
        }
      >
        success with clear
      </button>
      <button
        type="button"
        onClick={() =>
          notification.error({
            title: "Erro",
            description: "Algo falhou",
          })
        }
      >
        error
      </button>
      <button
        type="button"
        onClick={() =>
          notification.error({
            title: "Erro com limpeza",
            clearPrevious: true,
          })}
      >
        error with clear
      </button>
      <button
        type="button"
        onClick={() =>
          notification.warning({
            title: "Aviso",
            description: "Atenção aqui",
          })
        }
      >
        warning
      </button>
      <button
        type="button"
        onClick={() =>
          notification.warning({
            title: "Aviso com limpeza",
            clearPrevious: true,
          })
        }
      >
        warning with clear
      </button>
      <button
        type="button"
        onClick={() =>
          notification.info({
            title: "Info",
          })
        }
      >
        info
      </button>
      <button
        type="button"
        onClick={() =>
          notification.info({
            title: "Info com limpeza",
            clearPrevious: true,
          })
        }
      >
        info with clear
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

    await user.click(screen.getByRole("button", { name: /^success$/i }));
    expect(successMock).toHaveBeenCalledWith({
      message: "Sucesso",
      description: "Tudo certo",
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });
    await user.click(screen.getByRole("button", { name: /success with clear/i }));
    expect(destroyMock).toHaveBeenCalledTimes(1);
    expect(successMock).toHaveBeenCalledWith({
      message: "Sucesso com limpeza",
      description: undefined,
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });

    await user.click(screen.getByRole("button", { name: /^error$/i }));
    expect(errorMock).toHaveBeenCalledWith({
      message: "Erro",
      description: "Algo falhou",
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });

    await user.click(screen.getByRole("button", { name: /error with clear/i }));
    expect(destroyMock).toHaveBeenCalledTimes(2);
    expect(errorMock).toHaveBeenCalledWith({
      message: "Erro com limpeza",
      description: undefined,
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });

    await user.click(screen.getByRole("button", { name: /^warning$/i }));
    expect(warningMock).toHaveBeenCalledWith({
      message: "Aviso",
      description: "Atenção aqui",
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });
    await user.click(screen.getByRole("button", { name: /warning with clear/i }));
    expect(destroyMock).toHaveBeenCalledTimes(3);
    expect(warningMock).toHaveBeenCalledWith({
      message: "Aviso com limpeza",
      description: undefined,
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });

    await user.click(screen.getByRole("button", { name: /^info$/i }));
    expect(infoMock).toHaveBeenCalledWith({
      message: "Info",
      description: undefined,
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });
    await user.click(screen.getByRole("button", { name: /info with clear/i }));
    expect(destroyMock).toHaveBeenCalledTimes(4);
    expect(infoMock).toHaveBeenCalledWith({
      message: "Info com limpeza",
      description: undefined,
      placement: "topRight",
      duration: 5,
      closeIcon: null,
    });
  });
});
