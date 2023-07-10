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
import { intlLanguagesFormat } from "../type/type"
import {
  downloadFileFromBlob,
  makeLocalesInZip,
} from "../services/translatefiles";
import { translateService } from "../services/translate";

export default {
  name: "ExportFiles",
  props: {
    originalContent:{
      type: String,
      required: true,
    },
    extraPrompt:{
      type: String,
      required: false,
    }
  },
  setup(props, context) {
    const selectedLangs = ref([]);
    const popoverRef = ref(null);
    const singleTableRef = ref(null);
    let selectedRows = [];
    const configObject = localStorage.getItem("config");
    const config = JSON.parse(configObject);
    const options = ref(intlLanguagesFormat);
    
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

    const downloadFiles = async () => {
      try {
        const compressedContent = JSON.stringify(JSON.parse(props.originalContent))
        const res = await translateService({
          content: compressedContent,
          targetLang: selectedRows[0],
          extraPrompt: props.extraPrompt.value,
          config: {
            apiKey: config.apiKey,
          },
        });
        const data = prettierJson(res)
        const file = await makeLocalesInZip(data,"json");
        downloadFileFromBlob(file, "locales.zip");
      } catch (error) {
        console.log(error);
      } finally {
        closePopover()
      }
    }

    const prettierJson = (content) => {
      if (typeof content !== "string") return JSON.stringify(content, null, 2);
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch (error) {
        throw new Error("json is not valid");
      }
    };

    return {
      options,
      popoverRef,
      singleTableRef,
      selectedLangs,
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