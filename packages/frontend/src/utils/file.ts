export const saveLocalFile = (data: Blob, fileName: string): void => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  const url = window.URL.createObjectURL(data);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};
