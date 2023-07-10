<template>
  <el-popover
    placement="right"
    popper-class="modal-popover"
    :width="400"
    trigger="click"
    ref="popoverRef"
  >
    <template #reference>
      <el-button class="translate_files" style="margin-right: 16px"
        >Translate to files</el-button
      >
    </template>
    <el-table
      ref="singleTableRef"
      :data="options"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      class="staticTable"
    >
      <el-table-column property="language" label="Language" width="300" />
      <el-table-column type="selection" width="55" />
    </el-table>
    <button class="modal_button" @click="closePopover()">Close</button>
    <button class="modal_button" @click="handleTranslateToFile()">
      Translate
    </button>
  </el-popover>
</template>

<script>
import { ref, nextTick } from "vue";
import { intlLanguages } from "../type/type";
import {
  downloadFileFromBlob,
  exportLocalFiles,
  makeLocalesInZip,
} from "../services/translatefiles";

export default {
  name: "ExportFiles",
  props: {
    originalContent:{
      type: String,
      required: true,
    },
  },
  setup(props, context) {
    // const originalContent = ref(props.originalContent);
    const show = ref(false);
    const selectedLangs = ref([]);
    const popoverRef = ref(null);
    const singleTableRef = ref(null);
    let selectedRows = [];
    const configObject = localStorage.getItem("config");
    const config = JSON.parse(configObject);
    const options = ref([
      { language: "English | English " },
      { language: "Spanish | Español" },
      { language: "French | Français " },
      { language: "German | Deutsch" },
      { language: "Italian | Italiano " },
      { language: "Japanese | 日本語" },
      { language: "Korean | 한국어 " },
      { language: "Portuguese | Português" },
      { language: "Russian | Русский" },
      { language: "Chinese | 中文" },
      { language: "Arabic | العربية" },
      { language: "Dutch | Nederlands" },
      { language: "Greek | Ελληνικά" },
      { language: "Hindi | हिन्दी" },
      { language: "Indonesian | Bahasa Indonesia" },
      { language: "Polish | Polski" },
      { language: "Swedish | Svenska" },
      { language: "Turkish | Türkçe" },
      { language: "Vietnamese | Tiếng Việt" },
      { language: "Danish | Dansk" },
      { language: "Norwegian | Norsk" },
      { language: "Finnish | Suomi" },
      { language: "Czech | Čeština" },
      { language: "Hungarian | Magyar" },
      { language: "Romanian | Română" },
      { language: "Thai | ไทย" },
      { language: "Ukrainian | Українська" },
      { language: "Hebrew | עברית" },
      { language: "Persian | Farsi" },
    ]);
    
    // 获取选择需要翻译的语言
    const handleSelectionChange = (val) => {
      // 遍历 val 数组中的每个子元素
      val.forEach((selectedObject) => {
        // 获取语言属性的第一个值
        const language = Reflect.get(selectedObject, 'language').split('|')[0].trim();
        selectedRows.push(language)
      });
      // 数组去重
      selectedRows = Array.from(new Set(selectedRows));
    };

    // 关闭弹框
    const closePopover = () => {
      nextTick(() => {
        if (popoverRef.value) {
          popoverRef.value.hide();
        }
      }); 
    }

    // Translate成文件按钮
    const handleTranslateToFile = () => {
      context.emit('translate-to-files', props.originalContent); 
      downloadFiles()
    };

    const prettierJson = (content) => {
      if (typeof content !== "string") return JSON.stringify(content, null, 2);
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch (error) {
        throw new Error("json is not valid");
      }
    };

    const downloadFiles = async () => {
      try {
        const compressedContent = JSON.stringify(JSON.parse(props.originalContent))
        const res = await exportLocalFiles({
          content: compressedContent,
          targetLang: selectedRows,
          extraPrompt:"",
          config: {
            apiKey: config.apiKey,
          },
        });
        const data = prettierJson(res);
        const file = await makeLocalesInZip(data,"json");
        downloadFileFromBlob(file, "locales.zip");
      } catch (error) {
        console.log(error);
      } finally {
        show.value = false;
      }
    }

    return {
      options,
      popoverRef,
      singleTableRef,
      selectedLangs,
      intlLanguages,
      downloadFiles,
      handleSelectionChange,
      handleTranslateToFile,
      closePopover,
    };
  },
};
</script>
<style>
.modal-popover {
  height: 600px !important;
  overflow-y: auto !important;
  margin-top: 20px;
}
.el-table__header-wrapper .el-checkbox__inner {
  display: none;
}
.translate_files {
  width: 150px;
  height: 33px;
  margin-left: 20px;
  border-radius: 7px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: rgb(20, 153, 242);
  border: 2px solid rgb(20, 153, 242);
}
.modal_button {
  width: 135px;
  height: 33px;
  margin-top: 13px;
  margin-left: 31px;
  border-radius: 7px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: rgb(20, 153, 242);
  border: 2px solid rgb(20, 153, 242);
}
</style>