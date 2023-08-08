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
        :loading="isLoading"
        class="translate-button"
        @click="requestTranslation"
      >
        Translate
      </el-button>
      <ExportFiles
        :originalContent="originalContent"
        :extraPrompt="extraPrompt"
        :parameterChanged="parameterChanged"
        @translate-to-files="updateOriginalContent"
      />
      <ParameterSet @updateParameter="handleParameter" />
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
        <div class="text">
          Original locale
          <div title="导入文件内容" class="file">
            <FolderOpenIcon @click="importFile" class="importFile" />
          </div>
        </div>
        <div
          class="original"
          ref="editorOrigin"
        ></div>
      </div>
      <div class="translated-locale">
        <div class="text">
          Translated locale
          <div title="复制" class="copy">
            <DocumentDuplicateIcon @click="copy2Clipboard(transContent)" class="textCopy" />
          </div>
        </div>
        <div
          class="translated"
          ref="editorTrans"
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
import ParameterSet from "../components/ParameterSet.vue";
import { translateService } from "../services/translate";
import { intlLanguages } from "../type/type";
import { DocumentDuplicateIcon, FolderOpenIcon } from "@heroicons/vue/outline";
import { message } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

export default {
  name: "TranslateView",
  components: {
    TextField,
    ExportFiles,
    DocumentDuplicateIcon,
    FolderOpenIcon,
    ParameterSet,
  },
  setup() {
    const originalContent = ref("");
    let lang = ref(intlLanguages[0].value);
    const transContent = ref("");
    const extraPrompt = ref("");
    const editorOrigin = ref(null);
    const editorTrans = ref(null);
    let editor_origin = null;
    let editor_trans = null;
    const fileSelected = ref(false);
    const isLoading = ref(false);
    const parameterChanged = ref({
      temperature: 0,
      presencePenalty: 0,
      frequencyPenalty: 0,
      tokensValue: 2048,
    });

    // 初始化编辑器
    const initializeEditor = () => {
      editor_origin = monaco.editor.create(editorOrigin.value, {
        value: "",
        language: "json",
        theme: "vs",
        automaticLayout: true
      });
      editor_trans = monaco.editor.create(editorTrans.value, {
        value: "",
        language: "json",
        theme: "vs",
        automaticLayout: true
      });

      editor_origin.onDidChangeModelContent(() => {
        const originValue = editor_origin.getValue();
        originalContent.value = originValue;
      });
    };
    const updateExtraPrompt = (value) => {
      extraPrompt.value = value;
    };

    const updateOriginalContent = () => {
      originalContent.value = editor_origin.getValue();
    };

    const handleParameter = (val) => {
      parameterChanged.value = val;
    };

    // 翻译请求
    const requestTranslation = async () => {
      try {
        isLoading.value = true;
        const compressedContent = compress(originalContent);
        const data = await translateService({
          content: compressedContent,
          targetLang: lang.value,
          extraPrompt: extraPrompt.value,
          parameterChanged: parameterChanged.value,
        });
        transContent.value = prettierJson(data);
        editor_trans.setValue(transContent.value);
      } catch (error) {
        console.log(error);
        console.log("translate service error!!");
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      initializeEditor();
    });

    // 复制翻译结果
    const copy2Clipboard = (content) => {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          message.success("已成功复制到剪贴板");
        })
        .catch(() => {
          message.error("复制到剪贴板失败");
        });
    };

    // 导入文件
    const importFile = () => {
      fileSelected.value = false;
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.style.display = "none";
      fileInput.addEventListener("change", handleFileChange);
      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
    };

    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          editor_origin.setValue(content);
        };
        reader.readAsText(selectedFile);
        fileSelected.value = true;
      }
    };

    const compress = (content) => {
      try {
        return JSON.stringify(JSON.parse(content.value));
      } catch (error) {
        message.error("请输入正确的json数据");
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
      isLoading,
      parameterChanged,
      updateOriginalContent,
      requestTranslation,
      updateExtraPrompt,
      copy2Clipboard,
      importFile,
      handleFileChange,
      handleParameter,
    };
  },
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  display: inline-block;

  .content-header {
    display: flex;
    justify-content: center;

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
      width: 113px;
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
      background-color: #eaf6ff;
      color: rgb(20, 153, 242);
      border: 1px solid rgb(20, 153, 242);
    }
  }

  .text-field {
    width: 100%;
    margin-top: 10px;
    text-align: left;
    display: flex;
    justify-content: center;
  }

  .translate-content {
    width: 80%;
    height: auto;
    display: flex;
    justify-content: center;
    margin: 18px auto;


    .text {
      font-size: 20px;
      font-weight: 600;
      margin: 5px 0;
      text-align: center;
    }

    .original-locale {
      flex: 1;
      height: 680px;
      border-radius: 7px;
      border: 2px solid black;

      .file {
        width: 1.35rem;
        float: right;
        margin-right: 4px;
        .importFile {
          cursor: pointer;
        }
      }
      .original {
        width: 100%; 
        height: 93%;
        display: inline-block;
        text-align: left;
      }
    }

    .translated-locale {
      margin-left: 10px;
      flex: 1;
      height: 680px;
      border-radius: 7px;
      border: 2px solid black;

      .copy {
        width: 1.35rem;
        float: right;
        margin-right: 4px;
        .textCopy {
          cursor: pointer;
        }
      }

      .translated {
        width: 100%;
        height: 93%;
        display: inline-block;
        text-align: left;
      }
    }
  }
}
</style>
