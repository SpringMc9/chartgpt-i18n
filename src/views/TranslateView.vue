<template>
  <div class="about">
    <div class="container mx-auto p-4">
      <div class="content-header">
        <select class="select1" v-model="lang">
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
      <div class="mt-2">
        <TextField
          label="Customized Prompt (Optional)"
          placeholder="Add more prompt (like background knowledge) to help the translation if needed."
          :value="extraPrompt"
          :onChange="updateExtraPrompt"
        />
      </div>
      <div class="translate">
        <div class="original-locale">
          <div class="p-2">Original locale</div>
          <div ref="editorOrigin" style="height: 300px"></div>
        </div>
        <div class="translated-locale">
          <div class="p-2">Translated locale</div>
          <div ref="editorTrans" style="height: 300px"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
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
  mounted() {
    this.initializeEditor();
  },
  methods: {
    initializeEditor() {
      const editor_origin = monaco.editor.create(this.$refs.editorOrigin, {
        value: "",
        language: "json",
        theme: "vs-dark",
      });
      const editor_trans = monaco.editor.create(this.$refs.editorTrans, {
        value: "",
        language: "json",
        theme: "vs-dark",
      });

      editor_origin.onDidChangeModelContent(() => {
        const originValue = editor_origin.getValue();
        this.originalContent = originValue;
      });
      editor_trans.onDidChangeModelContent(() => {
        const transValue = editor_trans.getValue();
        this.transContent = transValue;
      });
    },
    updateExtraPrompt(value) {
      this.extraPrompt = value;
    },
  },
  setup() {
    let originalContent = ref("");
    let lang = ref(intlLanguages[1].value);
    let transContent = ref("");
    let extraPrompt = ref("");

    const compress = (content) => {
      try {
        return JSON.stringify(JSON.parse(content));
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
    // 翻译请求
    const requestTranslation = async () => {
      try {
        const compressedContent = compress(originalContent);
        const data = await translateService({
          content: compressedContent,
          targetLang: lang,
          extraPrompt: extraPrompt,
          config:{
            apiKey: "",
            serviceProvider:"openai"
          },
        });
        transContent = prettierJson(data);
      } catch (error) {
        console.log("translate service error!!");
      }
    };

    return {
      originalContent,
      lang,
      transContent,
      extraPrompt,
      intlLanguages,
      requestTranslation,
      compress,
      prettierJson,
    };
  },
};
</script>

<style scoped lang="scss">
.container {
  .content-header {
    .select1 {
      width: 100px;
      height: 25px;
      border-radius: 5%;
      border: 2px solid rgb(20, 153, 242);
    }
    .select2 {
      width: 70px;
      height: 25px;
      margin-left: 10px;
      border-radius: 5%;
      border: 2px solid rgb(20, 153, 242);
    }
    .translate-button {
      width: 70px;
      height: 25px;
      margin-left: 10px;
      border-radius: 5%;
      color: #fff;
      background-color: rgb(20, 153, 242);
      border: 2px solid rgb(20, 153, 242);
    }
  }
  .translate {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .original-locale {
      width: 300px;
      height: 200px;
      // border: 1px solid red;
    }

    .translated-locale {
      width: 300px;
      height: 200px;
      // border: 1px solid red;
    }
  }
}
</style>
