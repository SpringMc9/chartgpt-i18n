import { BlobWriter, ZipWriter, TextReader } from "@zip.js/zip.js";

export async function translate(content, targetLang, fileType, extraPrompt) {
  const res = await fetch("/api/fastTranslate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      targetLang: targetLang,
      extraPrompt,
    }),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

export async function exportLocalFiles(content, langList) {
  const res = await fetch("/api/exportLocalFiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      langList,
    }),
  });
  const data = await res.json();
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.message);
  }
}

export async function makeLocalesInZip(data, fileType) {
  const zipFileWriter = new BlobWriter();
  const zipWriter = new ZipWriter(zipFileWriter);
  for (let item of data) {
    const content = new TextReader(item.content);
    await zipWriter.add(`${item.lang}.${fileType}`, content);
  }
  const blob = await zipWriter.close();
  return new File([blob], `locales.${fileType}`);
}

export function downloadFileFromBlob(content, fileName) {
  const ele = document.createElement("a");
  ele.setAttribute("href", URL.createObjectURL(content));
  ele.setAttribute("download", fileName);
  ele.style.display = "none";
  document.body.appendChild(ele);
  ele.click();

  document.body.removeChild(ele);
}
