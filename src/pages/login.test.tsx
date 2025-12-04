import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginTela from "./login"

describe("LoginTela", () => {
  test("renderiza campos de formulário corretamente", () => {
    render(<LoginTela />)

    expect(screen.getByLabelText(/RF ou CPF/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Acessar/i })).toBeInTheDocument()
    expect(screen.getByText(/Esqueci minha senha/i)).toBeInTheDocument()
  })

  test("envia valores do formulário ao submeter", async () => {
    const user = userEvent.setup()
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {})

    render(<LoginTela />)

    const rfCpfInput = screen.getByLabelText(/RF ou CPF/i)
    const senhaInput = screen.getByLabelText(/Senha/i)
    const botao = screen.getByRole("button", { name: /Acessar/i })

    await user.type(rfCpfInput, "75856555")
    await user.type(senhaInput, "minhasenha123")
    await user.click(botao)

    expect(logSpy).toHaveBeenCalledWith("75856555", "minhasenha123")

    logSpy.mockRestore()
  })

  test("exibe ícones de ajuda nos labels", () => {
    render(<LoginTela />)

    const helpIcons = screen.getAllByText("?")
    expect(helpIcons).toHaveLength(2) // Um para RF ou CPF, outro para Senha
  })
})


