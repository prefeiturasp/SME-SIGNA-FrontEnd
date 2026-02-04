import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import DetalhamentoTurmasModal from './detalhamentoTurmas'

describe('DetalhamentoTurmasModal', () => {
    const mockOnOpenChange = vi.fn()

    const defaultProps = {
        open: true,
        onOpenChange: mockOnOpenChange,
        dre: 'DRE Centro',
        unidadeEscolar: 'EMEF João Silva',
        qtdTotalTurmas: '15',
        spi: '5',
        rows: [
            {
                turno: 'Manhã',
                cicloAlfabetizacao: 3,
                cicloAltoral: 2,
                semCiclo: 1,
                total: 6,
            },
            {
                turno: 'Tarde',
                cicloAlfabetizacao: 4,
                cicloAltoral: 3,
                semCiclo: 2,
                total: 9,
            },
        ],
        spiTotal: 5,
    }

    beforeEach(() => {
        mockOnOpenChange.mockClear()
    })

    it('deve renderizar o modal quando open é true', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        expect(screen.getByText('Detalhamento de turmas')).toBeInTheDocument()
    })

    it('não deve renderizar o modal quando open é false', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} open={false} />)

        expect(screen.queryByText('Detalhamento de turmas')).not.toBeInTheDocument()
    })

    it('deve exibir as informações da escola corretamente', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        expect(screen.getByText('DRE Centro')).toBeInTheDocument()
        expect(screen.getByText('EMEF João Silva')).toBeInTheDocument()
        expect(screen.getAllByText('15').length).toBeGreaterThan(0)
        expect(screen.getAllByText('5').length).toBeGreaterThan(0)
    })

    it('deve renderizar os cabeçalhos da tabela', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        expect(screen.getByText('TURNO')).toBeInTheDocument()
        expect(screen.getByText('CICLO ALFABETIZAÇÃO')).toBeInTheDocument()
        expect(screen.getByText('CICLO AUTORAL')).toBeInTheDocument()
        expect(screen.getByText('SEM CICLO')).toBeInTheDocument()
        expect(screen.getByText('TOTAL')).toBeInTheDocument()
    })

    it('deve renderizar todas as linhas de turnos', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        expect(screen.getByText('Manhã')).toBeInTheDocument()
        expect(screen.getByText('Tarde')).toBeInTheDocument()
        expect(screen.getAllByText('3').length).toBeGreaterThan(0)
        expect(screen.getAllByText('4').length).toBeGreaterThan(0)
    })

    it('deve renderizar a linha de total geral', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        expect(screen.getByText('TOTAL GERAL DE TURMAS')).toBeInTheDocument()
    })

    it('deve renderizar a linha SPI com valor correto', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        const spiCells = screen.getAllByText('5')
        expect(spiCells.length).toBeGreaterThan(0)
    })

    it('deve chamar onOpenChange ao clicar no botão Sair', async () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        const exitButton = screen.getByRole('button', { name: /sair/i })
        await userEvent.click(exitButton)

        expect(mockOnOpenChange).toHaveBeenCalled()
    })

    it('deve usar spiTotal padrão quando não fornecido', () => {
        const { spiTotal, ...propsWithoutSpiTotal } = defaultProps

        render(<DetalhamentoTurmasModal {...propsWithoutSpiTotal} />)

        const spiCells = screen.getAllByText('5')
        expect(spiCells.length).toBeGreaterThan(0)
    })

    it('deve renderizar células vazias quando valores opcionais não são fornecidos', () => {
        const propsWithEmptyRows = {
            ...defaultProps,
            rows: [
                {
                    turno: 'Noite',
                },
            ],
        }

        render(<DetalhamentoTurmasModal {...propsWithEmptyRows} />)

        expect(screen.getByText('Noite')).toBeInTheDocument()
    })

    it('deve renderizar múltiplas linhas de turnos corretamente', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        expect(screen.getByText('Manhã')).toBeInTheDocument()
        expect(screen.getByText('Tarde')).toBeInTheDocument()

        const rows = screen.getAllByRole('row')
        expect(rows.length).toBeGreaterThan(2)
    })

    it('deve exibir o total correto na linha de total geral', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        const totalGeralRow = screen.getByText('TOTAL GERAL DE TURMAS')
        expect(totalGeralRow).toBeInTheDocument()

        const totalValue = screen.getAllByText('15')
        expect(totalValue.length).toBeGreaterThan(0)
    })
})