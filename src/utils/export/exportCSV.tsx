import type { ColumnsType } from "antd/es/table";

type RowData = object;

const convertToCSV = <T extends RowData>(data: T[], columns: ColumnsType<T>) => {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0] as Record<string, unknown>).slice(1);
  const csvRows: string[] = [];

  const headersCSV = headers.map((item) => {
    const title = columns.find((column) => String(column.key) === item)?.title;
    return String(title);
  });

  csvRows.push(headersCSV.join(","));

  for (const row of data) {
    const values = headers.map((header) => {
      const value = (row as Record<string, unknown>)[header];
      const escaped = String(value ?? "").replace(/"/g, '\\"');
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
  