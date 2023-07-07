export const compressValuesInJson = (conentJson, path, pairs) => {
  if (typeof conentJson === "object") {
    Object.keys(conentJson).forEach((k) => {
      let p = path;
      if (p.length !== 0) {
        p += ".";
      }
      p += k;
      if (typeof conentJson[k] !== "object") {
        pairs.push([p, conentJson[k]]);
      } else {
        compressValuesInJson(conentJson[k], p, pairs);
      }
    });
  } else {
    pairs.push([path, conentJson]);
  }
};

export const groupPairs = (pairs) => {
  const requireTranslation = [];
  const noTranslation = [];
  for (let pair of pairs) {
    if (typeof pair[1] === "string") {
      requireTranslation.push(pair);
    } else {
      noTranslation.push(pair);
    }
  }
  return {
    requireTranslation,
    noTranslation,
  };
};

export const createChatCompletion = async (props) => {
  let url =
    "https://ai-proxy.ksord.com/wps3.openai.azure.com/openai/deployments/gpt-35-turbo-version-0301/chat/completions?api-version=2023-03-15-preview";
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Api-Key": "G4Q1R0jNruMDIzV0z32yEHaJxwDkNnnP",
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: "gpt-35-turbo-version-0301",
      frequency_penalty: 0,
      max_tokens: 1000,
      presence_penalty: 0,
      stream: true,
      temperature: 0.7,
      top_p: 1,
      messages: props.messages,
    }),
  });
  if (response.status !== 200) {
    throw new Error("failed to create chat completion");
  }
  return await response.json();
};
// export const createChatCompletion = async (props, config) => {
//   let url = "";
//   const headers = {
//     "Content-Type": "application/json",
//   };
//   if (config.serviceProvider === "openai") {
//     url = "https://api.openai.com/v1/chat/completions";
//     headers["Authorization"] = `Bearer ${config.apiKey}`;
//   }
//   console.log(props.messages);
//   const response = await fetch(url, {
//     method: "POST",
//     headers,
//     body: JSON.stringify({
//       model: props.model,
//       messages: props.messages,
//       temperature: 0,
//     }),
//   });
//   if (response.status !== 200) {
//     throw new Error("failed to create chat completion");
//   }
//   return await response.json();
// };

export const matchJSON = (str) => {
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
};
