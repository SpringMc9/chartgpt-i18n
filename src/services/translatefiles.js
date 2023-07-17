
import {
  compressValuesInJson,
  createChatCompletion,
  groupPairs,
  matchJSON,
} from "../utils";
import { buildJsonByPairs } from "../../api/utils/utils";
import { message } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

export async function translateAndExportFiles(req) {
  const { content, targetLang, extraPrompt } = req;
  console.log(targetLang);
  const translations = [];
  for (let i = 0; i < targetLang.length; i++) {
    console.log(targetLang[i]);
    const messages = [
      {
        role: "system",
        // content: `You are a helpful assistant that translates a i18n locale array content to ${targetLang}.
        //       It's a array structure, contains many strings, translate each of them and make a new array of translated strings.
        //       Consider all the string as a context to make better translation.\n`,
        content: `You are a helpful assistant that translates a i18n locale key-value objects to ${targetLang}.
            It's a key-value objects, contains many key-value values, translate each of them and make a new array of translated strings.
            Consider all the string as a context to make better translation.\n`,
      },
    ];
    if (typeof extraPrompt === "string" && extraPrompt.length > 0) {
      messages.push({
        role: "user",
        // content: `Other tips for translation: ${extraPrompt}\n
        //       Translate this array: \n\n\n`,
        content: `Other tips for translation: ${extraPrompt}\n  
            Translate this key-value object: \n\n\n`,
      });
    } else {
      messages.push({
        role: "user",
        // content: `Translate this array: \n\n\n`,
        content: `Translate this key-value object: \n\n\n`,
      });
    }
    const pairs = [];
    const locale = JSON.parse(content);

    compressValuesInJson(locale, "", pairs);
    const { requireTranslation, noTranslation } = groupPairs(pairs);
    const tasks = [];
    const CHUNK_SIZE = 60;
    let chunk = [];
    // let chunkSize = 0;
    for (let i = 0; i < requireTranslation.length; i++) {
      // chunk.push(requireTranslation[i][1]);
      chunk.push(requireTranslation[i]);
      // chunkSize += requireTranslation[i][1].length;
      // if (chunkSize >= CHUNK_SIZE) {
      if (chunk.length >= CHUNK_SIZE) {
        const freezeChunk = [...chunk];
        const finishedTask = await createChatCompletion({
          messages: [
            ...messages,
            {
              role: "user",
              content: JSON.stringify(freezeChunk),
            },
          ],
        })
          .then((completion) => {
            return matchJSON(completion);
          })
          .then((raw) => {
            JSON.parse(raw);
          })
          .then((r) => {
            if (r.length !== freezeChunk.length) {
              // message.error("返回数据数量不正确，请重新翻译")
              console.log("diff ", r.length, freezeChunk.length);
            }
            return r;
          })
          .catch((err) => {
            console.log(err);
            message.error("翻译失败，请重新翻译");
            return freezeChunk;
          });
        chunk = [];
        // chunkSize = 0;
        tasks.push(finishedTask);
      }
    }
    const freezeChunk = [...chunk];
    const ft = await createChatCompletion({
      messages: [
        ...messages,
        {
          role: "user",
          content: JSON.stringify(freezeChunk),
        },
      ],
    })
      .then((completion) => {
        return matchJSON(completion);
      })
      .then((raw) => {
        return JSON.parse(raw);
      })
      .then((r) => {
        if (r.length !== freezeChunk.length) {
          // message.error("返回数据数量不正确，请重新翻译")
          console.log("diff ", r.length, freezeChunk.length);
        }
        return r;
      })
      .catch((err) => {
        console.log(err);
        // message.error("翻译失败，请重新翻译
        return freezeChunk;
      });
    tasks.push(ft);
    const translated = (await Promise.all(tasks)).flatMap((t) => t);
    const nextPairs = translated.concat(noTranslation);
    const result = buildJsonByPairs(nextPairs);
    const data = prettierJson(result);
    translations.push(data);
  }
  await makeLocalesInZip(translations, targetLang);
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
  for (let i = 0; i < translations.length; i++) {
    const data = translations[i];
    const lang = targetLang[i];
    const fileName = `locales_${lang}.json`;
    const blob = new Blob([data], { type: 'application/json' });
    downloadFileFromBlob(blob, fileName)
  }
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
