export const compressValuesInJson = (conentJson, path, pairs) => {
  if (typeof conentJson === "object") {
    Object.keys(conentJson).forEach((k) => {
      let p = path;
      if (p.length !== 0) {
        p += "!!";
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
  const regex = /^[A-Za-z,. ]+$/;
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
      frequency_penalty: 0, // -2.0~2.0 值越高表达用词越罕见
      max_tokens: 2048, // 生成回应时允许的最大标记数
      presence_penalty: 0, // -2.0~2.0 值越高与上下文关联度越大
      stream: true,
      temperature: 0, // 0~2 值越高结果越随机多样
      top_p: 1,
      messages: props.messages,
    }),
  });
  if (response.status !== 200) {
    throw new Error("failed to create chat completion");
  }
  // 内部接口的返回数据的格式与openai不一样，需要进行调整转换（流式传输）
  const responseBody = await response.text();
  const lines = responseBody.split("\n");
  if (
    !regex.test(
      JSON.parse(lines[2].substr("data:".length)).choices[0].delta.content
    )
  ) {
    let contents = lines.reduce((result, line) => {
      if (line.startsWith("data:")) {
        const jsonStr = line.substr("data:".length);
        try {
          const data = JSON.parse(jsonStr);
          if (data.choices[0].delta.content) {
            result.push(data.choices[0].delta.content);
          }
        } catch (error) {
          //
        }
      }
      return result;
    }, []);
    // 检查最后一条json是不是被完整翻译
    if (contents[contents.length - 1] === '"],\n') {
      contents = contents.slice(0, contents.length - 1);
      contents.push('"]]');
    } else if (!contents[contents.length - 1].includes("]]")) {
      let index = contents.lastIndexOf('"],["');
      const index1 = contents.lastIndexOf('["');
      const index2 = contents.lastIndexOf(' ["');
      index = index > index1 ? index : index1;
      index = index > index2 ? index : index2;
      if (index !== -1) {
        if (contents[index] === '"],["') {
          contents = contents.slice(0, index);
          contents.push('"]]');
        } else {
          if (contents[index - 1] === " " || contents[index - 1] === "\n") {
            contents = contents.slice(0, index - 2);
            contents.push('"]]');
          } else if (contents[index - 1].includes('"')) {
            contents = contents.slice(0, index - 1);
            contents.push('"]]');
          } else {
            contents = contents.slice(0, index - 1);
            contents.push("]]");
          }
        }
      }
    }
    return await contents.join("");
  } else {
    return await "这是GPT的回答";
  }
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
