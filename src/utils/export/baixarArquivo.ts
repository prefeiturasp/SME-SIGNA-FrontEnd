export const baixarArquivo = (blob: Blob, nomeArquivo: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", nomeArquivo);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
};
