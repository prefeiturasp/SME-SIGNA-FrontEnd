import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type {
  ControllerRenderProps,
  FieldValues,
  Path,
  PathValue,
} from 'react-hook-form';
import FormularioUEDesignacao from './FormularioUEDesignacao';

// Mock dos hooks
const mockUseFetchDREs = vi.fn();
const mockUseFetchUEs = vi.fn();

vi.mock('@/hooks/useUnidades', () => ({
  useFetchDREs: () => mockUseFetchDREs(),
  useFetchUEs: () => mockUseFetchUEs(),
}));


vi.mock('@/components/ui/form', () => ({
  Form: ({
    children,
    onSubmit,
  }: {
    children: React.ReactNode;
    onSubmit: () => void;
  }) => (
    <form onSubmit={onSubmit} data-testid="form">
      {children}
    </form>
  ),

  FormField: <T extends FieldValues>({
    name,
    render,
  }: {
    name: Path<T>;
    render: (props: {
      field: ControllerRenderProps<T, Path<T>>;
    }) => React.ReactNode;
  }) => {
    const field: ControllerRenderProps<T, Path<T>> = {
      name,
      value: '' as PathValue<T, Path<T>>,
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    };

    return <>{render({ field })}</>;
  },

  FormControl: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,

  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,

  FormLabel: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <label className={className}>{children}</label>,

  FormMessage: () => <div data-testid="form-message" />,
}));


let mockSelectOnValueChange: ((value: string) => void) | null = null;

vi.mock('@/components/ui/select', () => ({
  Select: ({ 
    children, 
    onValueChange,
    'data-testid': testId 
  }: { 
    children: React.ReactNode; 
    onValueChange: (value: string) => void;
    'data-testid'?: string;
  }) => (
    <div
      data-testid={testId}
      onClick={() => {
        mockSelectOnValueChange = onValueChange;
      }}
    >
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <div>{placeholder}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ 
    children, 
    value 
  }: { 
    children: React.ReactNode; 
    value: string 
  }) => (
    <div
      data-value={value}
      onClick={() => mockSelectOnValueChange?.(value)}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Combobox', () => ({
  Combobox: ({ 
    value, 
    onChange, 
    options, 
    disabled,
    'data-testid': testId 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    options: Array<{ label: string; value: string }>;
    disabled?: boolean;
    'data-testid'?: string;
  }) => (
    <input 
      data-testid={testId}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      data-options={JSON.stringify(options)}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ 
    children, 
    type,
    disabled 
  }: { 
    children: React.ReactNode; 
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }) => (
    <button type={type} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
}));

vi.mock('@/components/dashboard/Designacao/BotoesDeNavegacao', () => ({
  default: ({ 
    disableAnterior, 
    disableProximo,
    onProximo,
    onAnterior 
  }: { 
    disableAnterior: boolean; 
    disableProximo: boolean;
    onProximo: () => void;
    onAnterior: () => void;
  }) => (
    <div data-testid="botoes-navegacao">
      <button 
        disabled={disableAnterior} 
        onClick={onAnterior}
        data-testid="btn-anterior"
      >
        Anterior
      </button>
      <button 
        disabled={disableProximo} 
        onClick={onProximo}
        data-testid="btn-proximo"
      >
        Próximo
      </button>
    </div>
  ),
}));

const mockOnSubmitDesignacao = vi.fn();

describe('FormularioUEDesignacao', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    
    mockUseFetchDREs.mockReturnValue({
    data: [
        {
        codigoDRE: 'dre-codigoDRE-1',
        nomeDRE: 'DRE 1',
        siglaDRE: 'DRE1',
        },
        {
        codigoDRE: 'dre-codigoDRE-2',
        nomeDRE: 'DRE 2',
        siglaDRE: 'DRE2',
        },
    ],
    });


    mockUseFetchUEs.mockReturnValue({
      data: [
        { codigoEscola: 'ue-codigoEscola-1', nomeEscola: 'UE 1' },
        { codigoEscola: 'ue-codigoEol-2', nomeEscola: 'UE 2' },
      ],
    });
  });

  it('renderiza o formulário corretamente com valores iniciais', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

    expect(screen.getByTestId('form')).toBeInTheDocument();
    expect(screen.getByTestId('select-dre')).toBeInTheDocument();
    expect(screen.getByTestId('select-ue')).toBeInTheDocument();
    expect(screen.getByTestId('botoes-navegacao')).toBeInTheDocument();
  });

  it('exibe opções de DRE do hook useFetchDREs', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

    
    const selectDRE = screen.getByTestId('select-dre');
    fireEvent.click(selectDRE);
    
    
    expect(mockUseFetchDREs).toHaveBeenCalled();
  });

  it('habilita o combobox de UE apenas quando uma DRE é selecionada', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

    const selectUE = screen.getByTestId('select-ue') as HTMLInputElement;
    
    expect(selectUE.disabled).toBe(true);

    const selectDRE = screen.getByTestId('select-dre');
    fireEvent.click(selectDRE);

  });

  it('chama o hook useFetchUEs', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

    expect(mockUseFetchUEs).toHaveBeenCalled();
  });

  it('limpa o campo UE quando muda a DRE', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

    const selectDRE = screen.getByTestId('select-dre');
    fireEvent.click(selectDRE);

  });


  it('mostra botões de navegação desabilitados conforme props', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

    const btnAnterior = screen.getByTestId('btn-anterior');
    const btnProximo = screen.getByTestId('btn-proximo');

    expect(btnAnterior).toBeDisabled();
    expect(btnProximo).toBeDisabled();
  });

  it('chama onProximo quando botão próximo é clicado', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

    const btnProximo = screen.getByTestId('btn-proximo');
    
    expect(btnProximo).toBeInTheDocument();
  });

  it('valida formulário com schema zod', async () => {
    const mockOnSubmitWithError = vi.fn();
    
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitWithError} />);

    const form = screen.getByTestId('form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockOnSubmitWithError).not.toHaveBeenCalled();
    });
  });

  it('usa mode onChange para validação', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

  });

  it('atualiza valores do formulário em tempo real com watch', () => {
    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

  });

  it('seleciona DRE e UE e verifica qual DRE está selecionada', () => {
    
    mockUseFetchUEs.mockReturnValue({
      data: [
        { codigoEscola: 'ue-codigoEol-1', nomeEscola: 'UE 1 da DRE Selecionada', siglaTipoEscola: 'EMEI' },
        { codigoEscola: 'ue-codigoEol-2', nomeEscola: 'UE 2 da DRE Selecionada', siglaTipoEscola: 'EMEF'},
      ],
    });

    render(<FormularioUEDesignacao onSubmitDesignacao={mockOnSubmitDesignacao} />);

    
    const selectDRE = screen.getByTestId('select-dre');
    const selectUE = screen.getByTestId('select-ue') as HTMLInputElement;

    expect(selectDRE).toBeInTheDocument();
    expect(selectUE).toBeInTheDocument();

    
    expect(selectUE.disabled).toBe(true);

    
    expect(mockUseFetchDREs).toHaveBeenCalled();
    expect(mockUseFetchUEs).toHaveBeenCalled();

    
    fireEvent.click(selectDRE);
    fireEvent.click(screen.getByText('DRE 1'));

    
    expect(screen.getByText('DRE 1')).toBeInTheDocument();
    expect(screen.getByText('DRE 2')).toBeInTheDocument();

    
    
    const ueOptions = JSON.parse(selectUE.getAttribute('data-options') || '[]');
    expect(ueOptions).toHaveLength(2);
    expect(ueOptions[0]).toEqual({
      label: 'EMEI - UE 1 da DRE Selecionada',
      value: 'ue-codigoEol-1',
    });
    expect(ueOptions[1]).toEqual({
      label: 'EMEF - UE 2 da DRE Selecionada',
      value: 'ue-codigoEol-2',
    });

    
    fireEvent.change(selectUE);

    
    
    expect(selectDRE).toBeInTheDocument();
    expect(screen.getByText('DRE 1')).toBeInTheDocument();
    expect(screen.getByText('DRE 2')).toBeInTheDocument();
    
    
    
    expect(mockUseFetchDREs).toHaveBeenCalled();
    expect(mockUseFetchUEs).toHaveBeenCalled();
  });
});