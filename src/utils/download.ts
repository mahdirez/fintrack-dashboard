export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob(["\uFEFF" + content], {
    type: `${mimeType};charset=utf-8;`,
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
