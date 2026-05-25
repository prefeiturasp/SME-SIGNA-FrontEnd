import { render, screen, within } from '@testing-library/react'
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
                cicloInterdisciplinar: 2,
                cicloAutoral: 1,
                semCiclo: 0,
                total: 6,
            },
            {
                turno: 'Tarde',
                cicloAlfabetizacao: 4,
                cicloInterdisciplinar: 3,
                cicloAutoral: 1,
                semCiclo: 1,
                total: 9,
            },
        ],
        spiRows: [
            {
                turno: 'SPI Manhã',
                cicloAlfabetizacao: 1,
                cicloInterdisciplinar: 1,
                cicloAutoral: 1,
                semCiclo: 0,
                total: 3,
            },
        ],
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
        expect(screen.getByText('CICLO INTERDISCIPLINAR')).toBeInTheDocument()
        expect(screen.getByText('CICLO AUTORAL')).toBeInTheDocument()
        expect(screen.getByText('SEM CICLO')).toBeInTheDocument()
        expect(screen.getByText('TOTAL')).toBeInTheDocument()
    })

    it('deve renderizar todas as linhas de turnos', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        expect(screen.getByText('Manhã')).toBeInTheDocument()
        expect(screen.getByText('Tarde')).toBeInTheDocument()
    })

    it('deve renderizar a linha de total geral', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        expect(screen.getByText('TOTAL GERAL DE TURMAS')).toBeInTheDocument()
        expect(screen.getAllByText('15').length).toBeGreaterThan(0)
    })

    it('deve renderizar linhas de SPI quando fornecidas', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        const spiRowLabel = screen.getByText('SPI Manhã')
        expect(spiRowLabel).toBeInTheDocument()

        const row = spiRowLabel.closest('tr')!
        const utils = within(row)

        expect(utils.getByText('3')).toBeInTheDocument()
    })

    it('não deve renderizar SPI quando spiRows não for fornecido', () => {
        const { spiRows, ...propsWithoutSpi } = defaultProps

        render(<DetalhamentoTurmasModal {...propsWithoutSpi} />)

        expect(screen.queryByText('SPI Manhã')).not.toBeInTheDocument()
    })

    it('deve chamar onOpenChange ao clicar no botão Sair', async () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        const exitButton = screen.getByRole('button', { name: /sair/i })
        await userEvent.click(exitButton)

        expect(mockOnOpenChange).toHaveBeenCalled()
    })

    it('deve exibir o valor de SPI quando spi possui conteúdo', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} />)

        const spiLabel = screen.getByText('SPI')
        const spiContainer = spiLabel.closest('div')!
        const utils = within(spiContainer)

        expect(utils.getByText('5')).toBeInTheDocument()
    })

    it('deve exibir "-" no campo SPI quando spi está vazio ou apenas espaços', () => {
        render(<DetalhamentoTurmasModal {...defaultProps} spi="   " />)

        const spiLabel = screen.getByText('SPI')
        const spiContainer = spiLabel.closest('div')!
        const utils = within(spiContainer)

        expect(utils.getByText('-')).toBeInTheDocument()
    })
})