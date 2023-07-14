import { BlobWriter, ZipWriter, TextReader } from "@zip.js/zip.js";
import {
  compressValuesInJson,
  createChatCompletion,
  groupPairs,
  matchJSON,
} from "../utils";
import { buildJsonByPairs } from "../../api/utils/utils";
import { message } from "ant-design-vue"
import 'ant-design-vue/dist/antd.css';

export async function translateAndExportFiles(req) {
  const { config, content, targetLang, extraPrompt } = req;
  const translations = [];
  for (let i = 0; i < targetLang.length; i++) {
    console.log("语言",targetLang[i]);
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant that translates a i18n locale array content to ${targetLang[i]}.   
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
            JSON.parse(raw)
          })
          .then((r) => {
            if (r.length !== freezeChunk.length) {
              console.log("diff ", r, freezeChunk);
            }
            return r;
          })
          .catch((err) => {
            console.log(err);
            message.error('翻译失败');
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
    const data = prettierJson(result)
    translations.push(data)  
  }
  console.log(translations);
  const zipBlob = await makeLocalesInZip(translations, targetLang);
  downloadFileFromBlob(zipBlob, "locales.zip");
}

const prettierJson = (content) => {
  if (typeof content !== "string") return JSON.stringify(content, null, 2);
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch (error) {
    throw new Error("json is not valid");
  }
};

export async function makeLocalesInZip(translations, targetLang) {
  const zipFileWriter = new BlobWriter();
  const zipWriter = new ZipWriter(zipFileWriter);
  for (let i = 0; i < translations.length; i++) {
    const translation = translations[i];
    const lang = targetLang[i];
    const contentReader = new TextReader(translation);
    const fileName = `locales_${lang}.json`;
    await zipWriter.add(fileName, contentReader);
  }

  const blob = await zipWriter.close();
  return blob;
}

export function downloadFileFromBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const ele = document.createElement("a");
  ele.href = url;
  ele.download = fileName;
  ele.style.display = "none";
  document.body.appendChild(ele);
  ele.click();
  URL.revokeObjectURL(url);
}