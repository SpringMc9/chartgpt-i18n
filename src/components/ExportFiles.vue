<template>
  <el-popover
    placement="right"
    popper-class="modal-popover"
    :width="400"
    trigger="click"
    ref="popoverRef"
  >
    <template #reference>
      <el-button class="translate_files" style="margin-right: 16px">
        Translate to files
      </el-button>
    </template>
    <el-table
      ref="singleTableRef"
      :data="translateOptions"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      class="staticTable"
    >
      <el-table-column property="language" label="Language" width="300" />
      <el-table-column type="selection" width="55" ref="selectAll" />
    </el-table>
    <el-button class="modal_button" @click="closePopover()">Close</el-button>
    <el-button class="modal_button" @click="handleTranslateToFile()">
      Translate
    </el-button>
  </el-popover>
</template>

<script>
import { ref, nextTick } from "vue";
import { translateAndExportFiles } from "../services/translatefiles";
import { translateOptions } from "../type/type";

export default {
  name: "ExportFiles",
  props: {
    originalContent: {
      type: String,
      required: true,
    },
    extraPrompt: {
      type: String,
      required: false,
    }
  },
  setup(props, context) {
    const popoverRef = ref(false);
    const selectAllTag = ref(0);
    const singleTableRef = ref(null);
    let selectedRows = [];

    // 获取选择需要翻译的语言
    const handleSelectionChange = (val) => {
      val.forEach((selectedObject) => {
        const language = Reflect.get(selectedObject, "language")
          .split("|")[0]
          .trim();
        selectedRows.push(language);
      });
      selectedRows = Array.from(new Set(selectedRows));
      if (selectedRows.length == translateOptions.length) {
        selectAllTag.value += 1;
        if (selectAllTag.value == 2) {
          selectedRows = [];
          selectAllTag.value = 0;
        }
      }
    };
    // 关闭弹框
    const closePopover = () => {
      nextTick(() => {
        if (popoverRef.value) {
          singleTableRef.value.clearSelection()
          popoverRef.value.hide();
        }
      });
    };
    // Translate成文件按钮
    const handleTranslateToFile = () => {
      context.emit("translate-to-files", props.originalContent);
      downloadFiles();
    };

    const downloadFiles = async () => {
      try {
        const compressedContent = JSON.stringify(
          JSON.parse(props.originalContent)
        );
        const res = await translateAndExportFiles({
          content: compressedContent,
          targetLang: selectedRows,
          extraPrompt: props.extraPrompt,
        }) 
        console.log(res);
      } catch (error) {
        console.log(error);
      } finally {
        closePopover();
      }
    };

    return {
      popoverRef,
      singleTableRef,
      selectAllTag,
      translateOptions,
      downloadFiles,
      handleSelectionChange,
      handleTranslateToFile,
      closePopover
    };
  },
};
</script>
<style lang="scss">
 .modal-popover {
  height: 600px;
  overflow-y: auto;
  margin-top: 5%;
}

.translate_files {
  width: 150px;
  height: 33px !important;
  margin-left: 20px !important;
  border-radius: 7px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #fff !important;
  background-color: rgb(20, 153, 242) !important;
  border: 2px solid rgb(20, 153, 242) !important;
}

.translate_files:hover {
  background-color: #eaf6ff !important;
  color: rgb(20, 153, 242) !important;
  border: 1px solid rgb(20, 153, 242) !important;
}


.modal_button {
  width: 135px;
  height: 33px !important;
  margin-top: 13px !important;
  margin-left: 31px !important;
  border-radius: 7px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #fff !important;
  background-color: rgb(20, 153, 242) !important;
  border: 2px solid rgb(20, 153, 242) !important; 
}
</style>
