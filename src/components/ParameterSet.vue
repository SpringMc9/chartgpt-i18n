<template>
  <div class="flex flex-wrap items-center">
    <el-dropdown>
      <el-button type="primary">
        Dropdown List<el-icon class="el-icon--right"><arrow-down /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>Action 1</el-dropdown-item>
          <el-dropdown-item>Action 2</el-dropdown-item>
          <el-dropdown-item>Action 3</el-dropdown-item>
          <el-dropdown-item>Action 4</el-dropdown-item>
          <el-dropdown-item>Action 5</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-slider
      v-model="value"
      :max="max"
      :format-tooltip="formatTooltip"
      @input="inputSlider"
    />
  </div>
</template>

<script>
// import { ref, nextTick } from "vue";
// import { translateAndExportFiles } from "../services/translatefiles";
// import { translateOptions } from "../type/type";

export default {
  name: "ParameterSet",
  props: {},
  setup() {
   
    return {
    };
  },
};
</script>
<style scoped lang="scss">

</style>
