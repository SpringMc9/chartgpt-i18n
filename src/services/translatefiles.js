import { BlobWriter, ZipWriter, TextReader } from "@zip.js/zip.js";
import {
  compressValuesInJson,
  createChatCompletion,
  groupPairs,
  matchJSON,
} from "../utils";
import { buildJsonByPairs } from "../../api/utils/utils";

export async function exportLocalFiles(req) {
  const { config, content, targetLang, extraPrompt } = req;
  console.log(targetLang);
  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant that translates a i18n locale array content to ${targetLang[0]}.   
            It's a array structure, contains many strings, translate each of them and make a new array of translated strings.  
            Consider all the string as a context to make better translation.\n`,
    },
  ];
  if (typeof extraPrompt === "string" && extraPrompt.length > 0) {
    messages.push({
      role: "user",
      content: `Other tips for translation: ${extraPrompt}\n  
            Translate this array: \n\n\n`,
    });
  } else {
    messages.push({
      role: "user",
      content: `Translate this array: \n\n\n`,
    });
  }
  const pairs = [];
  const locale = JSON.parse(content);

  compressValuesInJson(locale, "", pairs);
  const { requireTranslation, noTranslation } = groupPairs(pairs);
  const tasks = [];
  const CHUNK_SIZE = 1000;
  let chunk = [];
  let chunkSize = 0;
  for (let i = 0; i < requireTranslation.length; i++) {
    chunk.push(requireTranslation[i][1]);
    chunkSize += requireTranslation[i][1].length;
    if (chunkSize >= CHUNK_SIZE) {
      const freezeChunk = [...chunk];
      const finishedTask = await createChatCompletion(
        {
          messages: [
            ...messages,
            {
              role: "user",
              content: JSON.stringify(freezeChunk),
            },
          ],
        },
        config
      )
        .then((completion) => {
          return matchJSON(completion);
        })
        .then((raw) => {
          return JSON.parse(raw);
        })
        .then((r) => {
          if (r.length !== freezeChunk.length) {
            console.log("diff ", r, freezeChunk);
          }
          return r;
        })
        .catch((err) => {
          console.log(err);
          return freezeChunk;
        });
      chunk = [];
      chunkSize = 0;
      tasks.push(finishedTask);
    }
  }
  const freezeChunk = [...chunk];
  const ft = await createChatCompletion(
    {
      messages: [
        ...messages,
        {
          role: "user",
          content: JSON.stringify(freezeChunk),
        },
      ],
    },
    config
  )
    .then((completion) => {
      return matchJSON(completion);
    })
    .then((raw) => {
      return JSON.parse(raw);
    })
    .then((r) => {
      if (r.length !== freezeChunk.length) {
        console.log("diff ", r.length, freezeChunk.length);
      }
      return r;
    })
    .catch((err) => {
      console.log(err);
      return freezeChunk;
    });
  tasks.push(ft);
  chunk = [];
  chunkSize = 0;
  const translated = (await Promise.all(tasks)).flatMap((t) => t);
  const nextPairs = translated
    .map((t, i) => [requireTranslation[i][0], t])
    .concat(noTranslation);
  const result = buildJsonByPairs(nextPairs);
  return result;
}

export async function makeLocalesInZip(data, fileType) {
  const zipFileWriter = new BlobWriter();
  const zipWriter = new ZipWriter(zipFileWriter);
  const addedFiles = {};
  for (let item of data) {
    const content = new TextReader(item.content);
    const fileName = `locales.${fileType}`;
    // 检查是否已经存在相同的文件名
    if (addedFiles[fileName]) {
      let suffix = 1;
      while (addedFiles[`${fileName}_${suffix}`]) {
        suffix++;
      }
      addedFiles[`${fileName}_${suffix}`] = true;
    } else {
      addedFiles[fileName] = true;
    }
    const contentReader = new TextReader(content);
    // 添加文件到压缩包
    await zipWriter.add(fileName, contentReader);
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
