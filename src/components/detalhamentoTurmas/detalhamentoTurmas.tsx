import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface TurnoRow {
  turno: string
  cicloAlfabetizacao?: number
  cicloAltoral?: number
  semCiclo?: number
  total?: number
}

interface DetalhamentoTurmasModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly dre: string
  readonly unidadeEscolar: string
  readonly qtdTotalTurmas: string
  readonly spi: string
  readonly rows: TurnoRow[]
  readonly spiTotal?: number
}

interface InfoItemProps {
  label: string
  value: string
}

interface ThProps {
  children: React.ReactNode
  className?: string
}

interface TdProps {
  children?: React.ReactNode
  className?: string
  colSpan?: number
}

export default function DetalhamentoTurmasModal({
  open,
  onOpenChange,
  dre,
  unidadeEscolar,
  qtdTotalTurmas,
  spi,
  rows,
  spiTotal = 5,
}: DetalhamentoTurmasModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Detalhamento de turmas
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fechar modal"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-4 gap-8 border-b border-gray-200 bg-gray-50 px-4 py-4">
              <InfoItem label="DRE" value={dre} />
              <InfoItem label="UNIDADE ESCOLAR" value={unidadeEscolar} />
              <InfoItem label="Qtd. Total Turmas" value={qtdTotalTurmas} />
              <InfoItem label="SPI" value={spi} />
            </div>
          </div>
          <div className="px-6 py-4">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <Th className="text-left">TURNO</Th>
                  <Th className="text-center">CICLO ALFABETIZAÇÃO</Th>
                  <Th className="text-center">CICLO AUTORAL</Th>
                  <Th className="text-center">SEM CICLO</Th>
                  <Th className="text-right">TOTAL</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.turno} className="border-b border-gray-100">
                    <Td className="font-medium">{row.turno}</Td>
                    <Td className="text-center">
                      {row.cicloAlfabetizacao ?? ''}
                    </Td>
                    <Td className="text-center">{row.cicloAltoral ?? ''}</Td>
                    <Td className="text-center">{row.semCiclo ?? ''}</Td>
                    <Td className="text-right font-semibold">
                      {row.total ?? ''}
                    </Td>
                  </tr>
                ))}
                <tr className="border-b border-gray-100 bg-gray-50">
                  <Td colSpan={4} className="font-semibold">
                    TOTAL GERAL DE TURMAS
                  </Td>
                  <Td className="text-right font-semibold">{qtdTotalTurmas}</Td>
                </tr>
                <tr className="border-b border-gray-100">
                  <Td className="font-medium">SPI</Td>
                  <Td className="text-center">{spiTotal}</Td>
                  <Td className="text-center"></Td>
                  <Td className="text-center"></Td>
                  <Td className="text-right font-semibold">{spiTotal}</Td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="flex justify-end border-t border-gray-200 px-6 py-4">
            <Dialog.Close asChild>
              <button className="rounded bg-red-600 px-8 py-2 text-sm font-medium text-white hover:bg-red-700">
                Sair
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function InfoItem({ label, value }: Readonly<InfoItemProps>) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase text-gray-700">{label}</p>
      <p className="text-sm font-normal text-gray-900">{value}</p>
    </div>
  )
}

function Th({ children, className = '' }: Readonly<ThProps>) {
  return (
    <th
      className={`px-4 py-3 text-xs font-bold uppercase text-gray-700 ${className}`}
    >
      {children}
    </th>
  )
}

function Td({ children, className = '', colSpan }: Readonly<TdProps>) {
  return (
    <td colSpan={colSpan} className={`px-4 py-3 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  )
}