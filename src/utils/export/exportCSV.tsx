import type { ColumnsType } from "antd/es/table";

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

const convertToCSV = <T extends RowData>(data: T[], columns: ColumnsType<T>) => {
  if (!data || data.length === 0) return "";

  const csvRows: string[] = [];

  const headersCSV = columns
  .map((columns) => {    
    return String(columns.title);
  });

  csvRows.push(headersCSV.join(","));

  for (const row of data) {
    const values = columns.map((header) => {
      const value = (row as Record<string, unknown>)[String(header.key)];
 
      const escaped = serializeCSVValue(value).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

export const downloadCSV = <T extends RowData>(data: T[], columns: ColumnsType<T>) => {
  const csvContent = convertToCSV(data, columns);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `table-export-${new Date().getTime()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
  