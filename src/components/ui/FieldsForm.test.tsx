import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CheckboxField,
  DateField,
  DateRangeField,
  DateRangePickerField,
  InputField,
  SelectField,
  SwitchField,
} from "./FieldsForm";

type FormFieldState = {
  value: unknown;
  onChange: ReturnType<typeof vi.fn>;
  onBlur: ReturnType<typeof vi.fn>;
};

const fieldStateByName: Record<string, FormFieldState> = {};
const datePickerSpy = vi.fn();
const rangePickerSpy = vi.fn();
const registerMock = vi.fn((name: string) => ({ name }));
const controlMock = {};

const setFieldState = (name: string, value: unknown) => {
  fieldStateByName[name] = {
    value,
    onChange: vi.fn(),
    onBlur: vi.fn(),
  };
};

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <button className={className}>{children}</button>,
}));

vi.mock("@/components/ui/input-base", () => ({
  InputBaseMask: ({
    "data-testid": dataTestId,
    value,
    onChange,
    disabled,
    maxLength,
    placeholder,
    type,
  }: {
    "data-testid"?: string;
    value?: string;
    onChange?: (event: { target: { value: string } }) => void;
    disabled?: boolean;
    maxLength?: number;
    placeholder?: string;
    type?: string;
  }) => (
    <input
      data-testid={dataTestId}
      value={value ?? ""}
      onChange={(event) => onChange?.({ target: { value: event.target.value } })}
      disabled={disabled}
      maxLength={maxLength}
      placeholder={placeholder}
      type={type}
    />
  ),
}));

vi.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({
    children,
    onValueChange,
  }: {
    children: ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <div>
      <button type="button" data-testid="radio-group-trigger" onClick={() => onValueChange?.("nao")}>
        mudar-radio
      </button>
      {children}
    </div>
  ),
  RadioGroupItem: ({ id, "aria-label": ariaLabel }: { id: string; "aria-label"?: string }) => (
    <input id={id} aria-label={ariaLabel} readOnly />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children }: { children: ReactNode }) => <label>{children}</label>,
}));

vi.mock("@/components/ui/field", () => ({
  Field: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("./form", () => ({
  FormField: ({
    name,
    render,
  }: {
    name: string;
    render: (args: { field: FormFieldState }) => ReactNode;
  }) => {
    const current =
      fieldStateByName[name] ??
      ({
        value: "",
        onChange: vi.fn(),
        onBlur: vi.fn(),
      } as FormFieldState);
    fieldStateByName[name] = current;
    return <div data-testid={`form-field-${name}`}>{render({ field: current })}</div>;
  },
  FormControl: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FormItem: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  FormLabel: ({ children, className }: { children: ReactNode; className?: string }) => (
    <label className={className}>{children}</label>
  ),
  FormMessage: () => <span data-testid="form-message" />,
}));

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect?: (value: unknown) => void }) => (
    <button
      type="button"
      data-testid="calendar-select"
      onClick={() => onSelect?.({ from: new Date(2026, 1, 1), to: new Date(2026, 1, 10) })}
    >
      selecionar
    </button>
  ),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  CalendarIcon: () => <span data-testid="calendar-icon" />,
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" "),
}));

vi.mock("antd", () => {
  const DatePicker = (props: Record<string, unknown>) => {
    datePickerSpy(props);
    return <div data-testid="antd-date-picker" />;
  };
  function RangePicker(props: Record<string, unknown>) {
    rangePickerSpy(props);
    return <div data-testid="antd-range-picker" />;
  }
  DatePicker.RangePicker = RangePicker;
  const Switch = ({
    onChange,
    checked,
    disabled,
    "data-testid": dataTestId,
    checkedChildren,
    unCheckedChildren,
  }: {
    onChange?: (value: boolean) => void;
    checked?: boolean;
    disabled?: boolean;
    "data-testid"?: string;
    checkedChildren?: string;
    unCheckedChildren?: string;
  }) => (
    <button
      type="button"
      data-testid={dataTestId}
      data-checked={String(checked)}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
    >
      {checkedChildren}/{unCheckedChildren}
    </button>
  );
  return { DatePicker, Switch };
});

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    onValueChange,
  }: {
    children: ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <div>
      <button type="button" data-testid="select-trigger-action" onClick={() => onValueChange?.("mock-select-value")}>
        selecionar-opcao
      </button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
  SelectTrigger: ({
    children,
    "data-testid": dataTestId,
  }: {
    children: ReactNode;
    "data-testid"?: string;
  }) => <button data-testid={dataTestId}>{children}</button>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

describe("FieldsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(fieldStateByName).forEach((key) => delete fieldStateByName[key]);
  });

  it("renderiza CheckboxField e propaga troca de valor", () => {
    setFieldState("aceite", "sim");

    render(
      <CheckboxField
        register={registerMock as never}
        control={controlMock as never}
        name="aceite"
        label="Aceita?"
        dataTestId="aceite"
      />,
    );

    expect(screen.getByText("Aceita?")).toBeInTheDocument();
    expect(screen.getByLabelText("aceite-sim")).toBeInTheDocument();
    expect(screen.getByLabelText("aceite-nao")).toBeInTheDocument();
    expect(screen.getByText("Sim")).toBeInTheDocument();
    expect(screen.getByText("Não")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("radio-group-trigger"));
    expect(fieldStateByName.aceite.onChange).toHaveBeenCalledWith("nao");
  });

  it("renderiza InputField e envia somente target.value no onChange", () => {
    setFieldState("descricao", "valor inicial");

    render(
      <InputField
        register={registerMock as never}
        control={controlMock as never}
        name="descricao"
        label="Descrição"
        placeholder="Digite"
        dataTestId="campo-descricao"
        disabled
        maxLength={20}
      />,
    );

    const input = screen.getByTestId("campo-descricao");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("maxlength", "20");

    fireEvent.change(input, { target: { value: "novo valor" } });
    expect(fieldStateByName.descricao.onChange).toHaveBeenCalledWith("novo valor");
  });

  it("renderiza SelectField, lista opções e propaga seleção", () => {
    setFieldState("status", "1");

    render(
      <SelectField
        register={registerMock as never}
        control={controlMock as never}
        name="status"
        label="Status"
        placeholder="Selecione"
        dataTestId="status-select"
        options={[
          { value: "1", label: "Ativo" },
          { value: "2", label: "Inativo" },
        ]}
      />,
    );

    expect(screen.getByTestId("status-select")).toBeInTheDocument();
    expect(screen.getByTestId("select-item-1")).toHaveTextContent("Ativo");
    expect(screen.getByTestId("select-item-2")).toHaveTextContent("Inativo");

    fireEvent.click(screen.getByTestId("select-trigger-action"));
    expect(fieldStateByName.status.onChange).toHaveBeenCalledWith("mock-select-value");
  });

  it("DateField converte Date válida para dayjs e trata onChange", () => {
    setFieldState("data", new Date(2026, 0, 15));

    render(
      <DateField
        register={registerMock as never}
        control={controlMock as never}
        name="data"
        label="Data"
        placeholder="Escolha data"
        allowClear={false}
      />,
    );

    const props = datePickerSpy.mock.calls[0][0] as {
      value: unknown;
      allowClear: boolean;
      placeholder: string;
      onChange: (date: dayjs.Dayjs | null) => void;
      onBlur: () => void;
    };
    expect(dayjs.isDayjs(props.value)).toBe(true);
    expect(props.allowClear).toBe(false);
    expect(props.placeholder).toBe("Escolha data");

    props.onChange(dayjs("2026-01-20"));
    expect(fieldStateByName.data.onChange).toHaveBeenCalledWith(dayjs("2026-01-20").toDate());

    props.onChange(null);
    expect(fieldStateByName.data.onChange).toHaveBeenCalledWith(null);

    props.onBlur();
    expect(fieldStateByName.data.onBlur).toHaveBeenCalledTimes(1);
  });

  it("DateField usa value nulo quando a data é inválida e bloqueia Enter", () => {
    setFieldState("dataInvalida", "texto");

    render(
      <DateField
        register={registerMock as never}
        control={controlMock as never}
        name="dataInvalida"
        label="Data inválida"
      />,
    );

    const props = datePickerSpy.mock.calls[0][0] as {
      value: unknown;
      placeholder: string;
      onKeyDown: (event: { key: string; preventDefault: () => void; stopPropagation: () => void }) => void;
    };
    expect(props.value).toBeNull();
    expect(props.placeholder).toBe("Selecione a data");

    const enterEvent = {
      key: "Enter",
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    props.onKeyDown(enterEvent);
    expect(enterEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(enterEvent.stopPropagation).toHaveBeenCalledTimes(1);

    const otherEvent = {
      key: "Tab",
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    props.onKeyDown(otherEvent);
    expect(otherEvent.preventDefault).not.toHaveBeenCalled();
    expect(otherEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it("DateRangeField renderiza placeholder e atualiza intervalo via calendário", () => {
    setFieldState("periodo", null);

    render(
      <DateRangeField
        register={registerMock as never}
        control={controlMock as never}
        name="periodo"
        label="Período"
      />,
    );

    expect(screen.getByText("Selecione um período")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("calendar-select"));
    expect(fieldStateByName.periodo.onChange).toHaveBeenCalledWith({
      from: new Date(2026, 1, 1),
      to: new Date(2026, 1, 10),
    });
  });

  it("DateRangeField mostra data única e intervalo quando há from/to", () => {
    setFieldState("periodoUnico", { from: new Date(2026, 2, 5) });
    setFieldState("periodoCompleto", {
      from: new Date(2026, 3, 1),
      to: new Date(2026, 3, 10),
    });

    render(
      <>
        <DateRangeField
          register={registerMock as never}
          control={controlMock as never}
          name="periodoUnico"
          label="Período único"
        />
        <DateRangeField
          register={registerMock as never}
          control={controlMock as never}
          name="periodoCompleto"
          label="Período completo"
        />
      </>,
    );

    expect(screen.getByTestId("form-field-periodoUnico")).toHaveTextContent("05/03/2026");
    expect(screen.getByTestId("form-field-periodoCompleto")).toHaveTextContent("01/04/2026");
    expect(screen.getByTestId("form-field-periodoCompleto")).toHaveTextContent("10/04/2026");
  });

  it("DateRangePickerField converte valor válido, bloqueia Enter e transforma alteração", () => {
    setFieldState("periodoPicker", {
      from: new Date(2026, 4, 1),
      to: new Date(2026, 4, 8),
    });

    render(
      <DateRangePickerField
        register={registerMock as never}
        control={controlMock as never}
        name="periodoPicker"
        label="Período picker"
        allowClear={false}
      />,
    );

    const props = rangePickerSpy.mock.calls[0][0] as {
      value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
      allowClear: boolean;
      placeholder: [string, string];
      onKeyDown: (event: { key: string; preventDefault: () => void; stopPropagation: () => void }) => void;
      onChange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void;
      onBlur: () => void;
    };

    expect(props.allowClear).toBe(false);
    expect(props.placeholder).toEqual(["Data inicial", "Data final"]);
    expect(props.value?.[0]?.format("DD/MM/YYYY")).toBe("01/05/2026");
    expect(props.value?.[1]?.format("DD/MM/YYYY")).toBe("08/05/2026");

    const enterEvent = {
      key: "Enter",
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    props.onKeyDown(enterEvent);
    expect(enterEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(enterEvent.stopPropagation).toHaveBeenCalledTimes(1);

    props.onChange([dayjs("2026-06-01"), dayjs("2026-06-10")]);
    expect(fieldStateByName.periodoPicker.onChange).toHaveBeenCalledWith({
      from: dayjs("2026-06-01").toDate(),
      to: dayjs("2026-06-10").toDate(),
    });

    props.onChange(null);
    expect(fieldStateByName.periodoPicker.onChange).toHaveBeenCalledWith(null);

    props.onBlur();
    expect(fieldStateByName.periodoPicker.onBlur).toHaveBeenCalledTimes(1);
  });

  it("DateRangePickerField usa value nulo quando from não é Date válida", () => {
    setFieldState("periodoNulo", {
      from: "não é data",
      to: new Date(2026, 4, 8),
    });

    render(
      <DateRangePickerField
        register={registerMock as never}
        control={controlMock as never}
        name="periodoNulo"
        label="Período inválido"
        placeholder="Data custom"
      />,
    );

    const props = rangePickerSpy.mock.calls[0][0] as {
      value: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
      placeholder: [string, string];
    };
    expect(props.value).toBeNull();
    expect(props.placeholder).toEqual(["Data custom", "Data custom"]);
  });

  it("SwitchField converte o valor para booleano e propaga mudança", () => {
    setFieldState("usa_ste", "qualquer-valor-truthy");

    render(
      <SwitchField
        register={registerMock as never}
        control={controlMock as never}
        name="usa_ste"
        label="Utiliza para STE?"
        description="Descrição de uso"
        dataTestId="switch-usa-ste"
      />,
    );

    expect(screen.getByText("Utiliza para STE?")).toBeInTheDocument();
    expect(screen.getByText("Descrição de uso")).toBeInTheDocument();
    expect(screen.getByTestId("switch-usa-ste")).toHaveAttribute("data-checked", "true");
    expect(screen.getByTestId("switch-usa-ste")).not.toBeDisabled();
    expect(screen.getByTestId("switch-usa-ste")).toHaveTextContent("Sim/Não");

    fireEvent.click(screen.getByTestId("switch-usa-ste"));
    expect(fieldStateByName.usa_ste.onChange).toHaveBeenCalledWith(false);
  });
});
