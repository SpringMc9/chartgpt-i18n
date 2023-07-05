

export default async function translateService(req) {
  const { config, content, targetLang, extraPrompt } = req;
  const messages = [
    {
      role: "system",
      content: `You are a helpful assistant that translates a i18n locale array content to ${targetLang}.   
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
  const compressValuesInJson = (conentJson, path, pairs) => {
    if (typeof conentJson === 'object') {
      Object.keys(conentJson).forEach(k => {
        let p = path
        if (p.length !== 0) {
          p += '.'
        }
        p += k;
        if (typeof conentJson[k] !== 'object') {
          pairs.push([p, conentJson[k]])
        } else {
          compressValuesInJson(conentJson[k], p, pairs)
        }
      })
    } else {
      pairs.push([path, conentJson])
    }
  }
  const createChatCompletion = async (props, config) => {
    let url = '';
    const headers = {
      'Content-Type': 'application/json',
    }
    if (config.serviceProvider === 'openai') {
      // openai chat completion
      url = 'https://api.openai.com/v1/chat/completions'
      headers['Authorization'] = `Bearer ${config.apiKey}`
    } else if (config.serviceProvider === 'azure') {
      headers['api-key'] = `${config.apiKey}`
      url = `${config.baseURL}/openai/deployments/${config.deployName}/chat/completions?api-version=2023-03-15-preview`
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: props.model,
        messages: props.messages,
        temperature: 0,
      })
    })
    if (response.status !== 200) {
      throw new Error('failed to create chat completion')
    }
    return await response.json()
  }
  const groupPairs = (pairs) => {
    // const requireTranslation = [];  
    // const noTranslation = [];  
    for (let pair of pairs) {
      if (typeof pair[1] === 'string') {
        requireTranslation.push(pair)
      } else {
        noTranslation.push(pair)
      }
    }
  }
  const matchJSON = (str) => {
    let start = 0;
    let end = 0;
    let stack = [];
    for (let i = 0; i < str.length; i++) {
      if (str[i] === "[") {
        if (stack.length === 0) {
          start = i;
        }
        stack.push("[");
      }
      if (str[i] === "]") {
        stack.pop();
        if (stack.length === 0) {
          end = i;
          break;
        }
      }
    }
    return str.slice(start, end + 1);
  }
  const buildJsonByPairs = (pairs) => {  
    let ans = {};  
    for (let pair of pairs) {  
      const path = pair[0];  
      const keys = path.split('.');  
      let kIndex = 0;  
      let node = ans;  
      while (kIndex < keys.length - 1) {  
        if (typeof node[keys[kIndex]] === 'undefined') {  
          node[keys[kIndex]] = {};  
        }  
        node = node[keys[kIndex]];  
        kIndex++;  
      }  
      node[keys[kIndex]] = pair[1];  
    }  
    return ans;  
  }  

  compressValuesInJson(locale, "", pairs);
  const { requireTranslation, noTranslation } = groupPairs(pairs);
  console.log({
    pairs,
    requireTranslation,
    noTranslation
  })
  const tasks = [];
  const CHUNK_SIZE = 1000;
  let chunk = [];
  let chunkSize = 0;
  for (let i = 0; i < requireTranslation.length; i++) {
    // let chunkIndex = 0;
    chunk.push(requireTranslation[i][1]);
    chunkSize += requireTranslation[i][1].length;
    if (chunkSize >= CHUNK_SIZE) {
      const freezeChunk = [...chunk];
      const finishedTask = await createChatCompletion(
        {
          model: "gpt-3.5-turbo",
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
          return matchJSON(`${completion.choices[0].message?.content}`);
        })
        .then((raw) => JSON.parse(raw))
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
      // chunkIndex++;
      tasks.push(finishedTask);
    }
  }
  const freezeChunk = [...chunk];
  const ft = await createChatCompletion(
    {
      model: "gpt-3.5-turbo",
      messages: [
        ...messages,
        {
          role: "user",
          content: JSON.stringify(freezeChunk),
        },
      ]
    },
    config
  )
    .then((completion) => {
      return matchJSON(`${completion.choices[0].message?.content}`);
    })
    .then((raw) => JSON.parse(raw))
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
  const nextPairs = (translated.map((t, i) => [requireTranslation[i][0], t])).concat(noTranslation);
  const result = buildJsonByPairs(nextPairs);
  console.log(result)
  return result;
}  