<template>
  <div class="container">
    <div class="content-header">
      <select class="select" v-model="lang">
        <option
          v-for="option in intlLanguages"
          :value="option.value"
          :key="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <button
        type="button"
        class="translate-button"
        @click="requestTranslation"
      >
        Translate
      </button>
      <!-- <ExportFiles :originalContent="originalContent" :fileType="fileType" /> -->
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
        <div class="text">Translated locale</div>
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
import { ref, onMounted, onUpdated } from "vue";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import TextField from "../components/TextField";
import { translateService } from "../services/translate";

const intlLanguages = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Italian", label: "Italiano" },
  { value: "Japanese", label: "日本語" },
  { value: "Korean", label: "한국어" },
  { value: "Portuguese", label: "Português" },
  { value: "Russian", label: "Русский" },
  { value: "Chinese", label: "中文" },
  { value: "Arabic", label: "العربية" },
  { value: "Dutch", label: "Nederlands" },
  { value: "Greek", label: "Ελληνικά" },
  { value: "Hindi", label: "हिन्दी" },
  { value: "Indonesian", label: "Bahasa Indonesia" },
  { value: "Polish", label: "Polski" },
  { value: "Swedish", label: "Svenska" },
  { value: "Turkish", label: "Türkçe" },
  { value: "Vietnamese", label: "Tiếng Việt" },
  { value: "Danish", label: "Dansk" },
  { value: "Norwegian", label: "Norsk" },
  { value: "Finnish", label: "Suomi" },
  { value: "Czech", label: "Čeština" },
  { value: "Hungarian", label: "Magyar" },
  { value: "Romanian", label: "Română" },
  { value: "Thai", label: "ไทย" },
  { value: "Ukrainian", label: "Українська" },
  { value: "Hebrew", label: "עברית" },
  { value: "Persian", label: "Farsi" },
];

export default {
  name: "TranslateView",
  components: {
    TextField,
  },
  setup() {
    const originalContent = ref("");
    let lang = ref(intlLanguages[1].value);
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

    // 翻译请求
    const requestTranslation = async () => {
      try {
        const compressedContent = compress(originalContent);
        const data = await translateService({
          content: compressedContent,
          targetLang: lang.value,
          extraPrompt: extraPrompt.value,
          config: {
            apiKey: config.apiKey,
            serviceProvider: "openai",
          },
        });
        transContent.value = prettierJson(data);
        editor_trans.setValue(transContent.value);
      } catch (error) {
        console.log(error);
        console.log("translate service error!!");
      }
    };

    onMounted(() => {
      initializeEditor();
    });

    onUpdated(() => {
      if (transContent.value !== editor_trans.getValue()) {
        editor_trans.setValue(transContent.value);
      }
    });

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
      requestTranslation
    };
  },
};
</script>

<style scoped lang="scss">
.container {
  display: inline-block;
  .content-header {
    display: inline-block;
    .select {
      width: 100px;
      height: 33px;
      font-size: 16px;
      border-radius: 7px;
      border: none;
      outline: none;
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
      width: 601px;
      height: 685px;
      border-radius: 7px;
      border: 2px solid black;

      .original {
        display: inline-block;
        text-align: left;
      }
    }

    .translated-locale {
      width: 601px;
      margin-left: 10px;
      height: 685px;
      border-radius: 7px;
      border: 2px solid black;

      .translated {
        display: inline-block;
        text-align: left;
      }
    }
  }
}
</style>
