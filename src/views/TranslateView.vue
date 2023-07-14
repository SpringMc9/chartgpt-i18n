<template>
  <div class="container">
    <div class="content-header">
      <select class="selectOption" v-model="lang">
        <option
          v-for="option in intlLanguages"
          :value="option.value"
          :key="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <el-button
        type="button"
        class="translate-button"
        @click="requestTranslation"
      >
        Translate
      </el-button>
      <ExportFiles :originalContent="originalContent" @translate-to-files="updateOriginalContent"/>
    </div>
    <div class="text-field">
      <TextField
        label="Customized Prompt (Optional)"
        placeholder="Add more prompt (like background knowledge) to help the translation if needed."
        :value="extraPrompt"
        :onChange="updateExtraPrompt"
      />
    </div>
    <div class="translate-content">
      <div class="original-locale">
        <div class="text">Original locale</div>
        <div
          class="original"
          ref="editorOrigin"
          style="width: 600px; height: 650px"
        ></div>
      </div>
      <div class="translated-locale">
        <div class="text">
          Translated locale
          <DocumentDuplicateIcon
            @click="copy2Clipboard(transContent)"
            class="copy"
          />
        </div>
        <div
          class="translated"
          ref="editorTrans"
          style="width: 600px; height: 650px"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import TextField from "../components/TextField";
import ExportFiles from "../components/ExportFiles";
import { translateService } from "../services/translate";
import { intlLanguages } from "../type/type";
import { DocumentDuplicateIcon } from "@heroicons/vue/outline";
import { message } from "ant-design-vue"
import 'ant-design-vue/dist/antd.css';

export default {
  name: "TranslateView",
  components: {
    TextField,
    ExportFiles,
    DocumentDuplicateIcon,
  },
  setup() {
    const originalContent = ref("");
    let lang = ref(intlLanguages[0].value);
    const transContent = ref("");
    let extraPrompt = ref("");
    const editorOrigin = ref(null);
    const editorTrans = ref(null);
    let editor_origin = null;
    let editor_trans = null;
    // 获取localStorage中的openai
    const configObject = localStorage.getItem("config");
    const config = JSON.parse(configObject);

    // 初始化编辑器
    const initializeEditor = () => {
      editor_origin = monaco.editor.create(editorOrigin.value, {
        value: "",
        language: "json",
        theme: "vs",
      });
      editor_trans = monaco.editor.create(editorTrans.value, {
        value: "",
        language: "json",
        theme: "vs",
      });

      editor_origin.onDidChangeModelContent(() => {
        const originValue = editor_origin.getValue();
        originalContent.value = originValue;
      });
    };
    const updateExtraPrompt = (value) => {
      extraPrompt = value;
    };

    const updateOriginalContent = () => {
      originalContent.value = editor_origin.getValue()
    }

    // 翻译请求
    const requestTranslation = async () => {
      try {
        const compressedContent = compress(originalContent);
        console.log(compressedContent);
        const data = await translateService({
          content: compressedContent,
          targetLang: lang.value,
          extraPrompt: extraPrompt.value,
          config: {
            apiKey: config.apiKey,
          },
        });
        transContent.value = prettierJson(data);
        editor_trans.setValue(transContent.value)
      } catch (error) {
        console.log(error);
        console.log("translate service error!!");
      }
    };

    onMounted(() => {
      initializeEditor();
    });

    // 复制翻译结果
    const copy2Clipboard = (content) => {
      navigator.clipboard.writeText(content)
      .then(() => {
        message.success('已成功复制到剪贴板');
      })
      .catch(() => {
        message.error('复制到剪贴板失败');
      });
    };

    const compress = (content) => {
      try {
        return JSON.stringify(JSON.parse(content.value));
      } catch (error) {
        throw new Error("json is not valid");
      }
    };

    const prettierJson = (content) => {
      if (typeof content !== "string") return JSON.stringify(content, null, 2);
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch (error) {
        throw new Error("json is not valid");
      }
    };
    return {
      originalContent,
      lang,
      transContent,
      extraPrompt,
      editorOrigin,
      editorTrans,
      intlLanguages,
      editor_origin,
      editor_trans,
      updateOriginalContent,
      requestTranslation,
      updateExtraPrompt,
      copy2Clipboard,
    };
  },
};
</script>

<style scoped lang="scss">
.container {
  display: inline-block;
  .content-header {
    display: inline-block;
    .selectOption {
      width: 100px;
      height: 33px;
      font-size: 16px;
      border-radius: 7px;
      border: none;
      outline: none;
    }
    .selectOption option:hover {
      background-color: aqua;
    }

    .translate-button {
      width: 90px;
      height: 33px;
      margin-left: 20px;
      border-radius: 7px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      background-color: rgb(20, 153, 242);
      border: 2px solid rgb(20, 153, 242);
    }
    .translate-button:hover {
      background-color: #EAF6FF;
      color: rgb(20, 153, 242);
      border: 1px solid rgb(20, 153, 242);
    }
  }
  .text-field {
    margin-top: 10px;
    text-align: left;
  }

  .translate-content {
    height: auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 10px;
    margin-bottom: 20px;

    .text {
      font-size: 20px;
      font-weight: 600;
      margin: 5px 0;
    }
    .original-locale {
      width: 606px;
      height: 696px;
      border-radius: 7px;
      border: 2px solid black;

      .original {
        display: inline-block;
        text-align: left;
      }
    }

    .translated-locale {
      width: 606px;
      margin-left: 10px;
      height: 696px;
      border-radius: 7px;
      border: 2px solid black;

      .copy {
        width: 1.35rem;
        float: right;
        margin-right: 3px;
      }
      .translated {
        display: inline-block;
        text-align: left;
      }
    }
  }
}
</style>
