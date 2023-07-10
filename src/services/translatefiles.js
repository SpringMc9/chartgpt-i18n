import { BlobWriter, ZipWriter, TextReader } from "@zip.js/zip.js";

export async function makeLocalesInZip(data, fileType) {
  const zipFileWriter = new BlobWriter();
  const zipWriter = new ZipWriter(zipFileWriter);
  let suffix = 1;
  const contentReader = new TextReader(data);
  const fileName = `locales_${suffix}.${fileType}`;
  await zipWriter.add(fileName, contentReader);
  const blob = await zipWriter.close();
  return new File([blob], `locales.${fileType}`);
}

export function downloadFileFromBlob(content, fileName) {
  const ele = document.createElement("a");
  ele.setAttribute("href", URL.createObjectURL(content));
  ele.setAttribute("download", fileName);
  ele.style.display = "none";
  document.body.appendChild(ele);
  ele.dispatchEvent(new MouseEvent("click"));
}
