<template>
  <div class="about">
    <div class="container mx-auto p-4">
      <div class="dark flex items-center">
        <select id="select1" v-model="lang">
          <option
            v-for="option in intlLanguages"
            :value="option.value"
            :key="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <select id="select2" v-model="fileType">
          <option
            v-for="option in fileTypes"
            :value="option.value"
            :key="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <button
          type="button"
          class="ml-2 px-6 inline-flex rounded bg-indigo-500 shadow-indigo-500/50 py-1.5 px-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          @click="requestTranslation"
        >
          <Spinner v-if="loading" />
          Translate
        </button>
        <!-- <ExportFiles :originalContent="originalContent" :fileType="fileType" /> -->
      </div>
      <div class="mt-2">
        <TextField
          label="Customized Prompt (Optional)"
          placeholder="Add more prompt (like background knowledge) to help the translation if needed."
          :value="extraPrompt"
          @onChange="
            (val) => {
              setExtraPrompt(val);
            }
          "
        />
      </div>
      <div class="grid grid-cols-2 mt-6">
        <div class="shadow-lg border border-gray-700 rounded m-2">
          <div class="p-2">Original locale</div>
          <MonacoEditor
            :value="originalContent"
            @onChange="
              (val) => {
                setOriginalContent(val ?? '');
              }
            "
            height="600px"
            :language="fileType"
            theme="vs-dark"
          />
        </div>
        <div class="shadow-lg border border-gray-700 rounded m-2">
          <div class="p-2">
            Translated locale
            <DocumentDuplicateIcon
              @click="
                () => {
                  copy2Clipboard(transContent);
                  notify(
                    {
                      type: 'success',
                      title: 'copied!',
                      message: 'copy to clipboard',
                    },
                    1000
                  );
                }
              "
              class="float-right w-5 text-white cursor-pointer hover:scale-110"
            />
          </div>
          <MonacoEditor
            :value="transContent"
            height="600px"
            :language="fileType"
            theme="vs-dark"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import  { ref } from "vue";
// import  { useContext } from "vue";
// import { toJS } from "mobx";
// import { Link, RouterLink } from "vue-router";
// import MonacoEditor, { loader } from "@monaco-editor/vue3";
import MonacoEditor from "@vue/reactivity";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import yaml from "js-yaml";
// import ExportFiles from "./exportFiles";
// import { DocumentDuplicateIcon } from "@heroicons/vue/outline";
import Spinner from "../components/SpinnerLoading";
// import { useNotification } from "../components/NotificationProvider.vue";
import TextField from "../components/TextField";
import { translateService } from "../services/translate";
// import { useGlobalStore } from "../../store";

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new MonacoEditor.editor.createWebWorker();
  },
};

// loader.config({ paths: { vs: "/assets" } });
// loader.init();
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
const fileTypes = [
  { value: "json", label: "json" },
  { value: "yaml", label: "yaml" },
];

export default {
  name: "TranslateView",
  components: {
    Spinner,
    TextField,
  },
  setup() {
    const originalContent = ref("");
    const lang = ref(intlLanguages[1].value);
    const fileType = ref("");
    const transContent = ref("");
    const extraPrompt = ref("");
    const loading = ref(false);
    // const { notify } = useContext(useNotification);
    // const { commonStore } = useGlobalStore();

    const requestTranslation = async () => {
      loading.value = true;
      try {
        const compressedContent = compress(
          originalContent.value,
          fileType.value
        );
        const data = await translateService({
          content: compressedContent,
          targetLang: lang.value,
          extraPrompt: extraPrompt.value,
          // config: toJS(commonStore.config),
        });
        transContent.value = prettierJson(data, fileType.value);
      } catch (error) {
        // notify(
        //   {
        //     title: "translate service error",
        //     message: `${error}`,
        //     type: "error",
        //   },
        //   3000
        // );
      } finally {
        loading.value = false;
      }
    };

    const compress = (content, fileType) => {
      try {
        return fileType === "json"
          ? JSON.stringify(JSON.parse(content))
          : JSON.stringify(yaml.load(content));
      } catch (error) {
        throw new Error(`${fileType} is not valid`);
      }
    };

    const prettierJson = (content, fileType) => {
      if (typeof content !== "string") return JSON.stringify(content, null, 2);
      try {
        return fileType === "json"
          ? JSON.stringify(JSON.parse(content), null, 2)
          : yaml.dump(yaml.load(content));
      } catch (error) {
        throw new Error("json is not valid");
      }
    };

    const copy2Clipboard = (content) => {
      navigator.clipboard.writeText(content);
    };

    return {
      originalContent,
      lang,
      transContent,
      extraPrompt,
      loading,
      fileType,
      intlLanguages,
      fileTypes,
      requestTranslation,
      compress,
      prettierJson,
      copy2Clipboard,
    };
  }
};
</script>


