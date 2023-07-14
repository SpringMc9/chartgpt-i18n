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
    "Api-Key": "G4Q1R0jNruMDIzV0z32yEHaJxwDkNnnP",
    "Content-Type": "application/json; charset=utf-8",
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
  // 内部接口的返回数据的格式与openai不一样，需要进行调整转换
  const responseBody = await response.text();
  console.log(responseBody);
  const lines = responseBody.split("\n");
  console.log("lines",lines);
  const contents = lines.reduce((result, line) => {
    console.log(line.startsWith("data:"));
    if (line.startsWith("data:")) {
      const jsonStr = line.substr("data:".length);
      try {
        const data = JSON.parse(jsonStr);
        console.log(data);
        if (data.choices[0].delta.content) {
          result.push(data.choices[0].delta.content);
        }
      } catch (error) {
        // 
      }
    }
    return result;
  }, []);
  console.log(contents);
  console.log(contents.join(""));
  return await contents.join("");
};

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
