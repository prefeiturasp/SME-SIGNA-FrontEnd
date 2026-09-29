import type { ColumnsType } from "antd/es/table";
import { baixarArquivo } from "./baixarArquivo";

type RowData = object;

const serializeCSVValue = (value: unknown): string => {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return "";
};

// Separador ";" e BOM para o Excel em pt-BR abrir o arquivo com colunas e acentos corretos
const CSV_SEPARATOR = ";";
const CSV_BOM = "\uFEFF";

const convertToCSV = <T extends RowData>(data: T[], columns: ColumnsType<T>) => {
  if (!data || data.length === 0) return "";

  const csvRows: string[] = [];

  const headersCSV = columns.map((col) =>
    typeof col.title === "string" ? col.title : ""
  );

  csvRows.push(headersCSV.join(CSV_SEPARATOR));

  for (const row of data) {
    const values = columns.map((header) => {
      const value = (row as Record<string, unknown>)[String(header.key)];

      // RFC 4180: aspas dentro do campo são escapadas duplicando-as
      const escaped = serializeCSVValue(value).replaceAll('"', '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(CSV_SEPARATOR));
  }

  return csvRows.join("\n");
};

export const downloadCSV = <T extends RowData>(
  data: T[],
  columns: ColumnsType<T>,
  fileName: string = `table-export-${Date.now()}.csv`
) => {
  const csvContent = convertToCSV(data, columns);
  const blob = new Blob([CSV_BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  baixarArquivo(blob, fileName);
};
  