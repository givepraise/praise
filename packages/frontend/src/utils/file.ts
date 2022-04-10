export const saveLocalFile = (data: Blob, fileName: string): void => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  const url = window.URL.createObjectURL(data);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const imageFullPath = (filename: string): string => {
  const apiUrl = process.env.REACT_APP_API_URL || '';
  return `${apiUrl}/uploads/${filename}`;
};
