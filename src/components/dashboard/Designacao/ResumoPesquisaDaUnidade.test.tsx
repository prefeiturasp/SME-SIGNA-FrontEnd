import { render, screen } from "@testing-library/react"
import ResumoPesquisaDaUnidade from "./ResumoPesquisaDaUnidade"




describe("ResumoPesquisadaUnidade",()=>{

  it('renderiza o componente',()=>{
    render(<ResumoPesquisaDaUnidade defaultValues={{ dre: '123', lotacao: '456', estrutura_hierarquica: '789' }} isLoading={false} />)
    expect(screen.getByText('123')).toBeInTheDocument()
    expect(screen.getByText('456')).toBeInTheDocument()
    expect(screen.getByText('789')).toBeInTheDocument()
  })

  it('renderiza o loading quando isLoading é true',()=>{
    render(<ResumoPesquisaDaUnidade defaultValues={{ dre: '123', lotacao: '456', estrutura_hierarquica: '789' }} isLoading={true} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
  
})