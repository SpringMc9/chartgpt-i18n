<template>
  <el-popover
    placement="right"
    popper-class="setting-popover"
    :width="400"
    trigger="click"
    ref="popoverRef"
  >
    <template #reference>
      <Setting class="settingIcon" />
    </template>
    <div class="setParm">
      <div class="parm">
        <span>temperature(0.0~2.0): {{ temperature }}</span>
        <input
          type="range"
          v-model="temperature"
          min="0.0"
          max="2.0"
          step="0.1"
          class="slider first"
        />
      </div>
      <div class="parm">
        <span
          >max_tokens: &nbsp;
          <input type="text" class="textInput" v-model="tokensValue" @input="handleInputChange"
        /></span>
      </div>
      <div class="parm">
        <span>presence_penalty(-2.0~2.0): {{ presencePenalty }}</span>
        <input
          type="range"
          v-model="presencePenalty"
          min="-2.0"
          max="2.0"
          step="0.1"
          class="slider second"
        />
      </div>
      <div class="parm">
        <span>frequency_penalty(-2.0~2.0): {{ frequencyPenalty }}</span>
        <input
          type="range"
          v-model="frequencyPenalty"
          min="-2.0"
          max="2.0"
          step="0.1"
          class="slider third"
        />
      </div>
    </div>
  </el-popover>
</template>

<script>
import { ref, watch } from "vue";
import { Setting } from "@element-plus/icons-vue";

export default {
  name: "ParameterSet",
  components: {
    Setting,
  },
  props: {},
  setup(_, { emit }) {
    const temperature = ref(0.0);
    const presencePenalty = ref(0.0);
    const frequencyPenalty = ref(0.0);
    const tokensValue = ref(2048);
    const parameterChanged = ref({
      temperature: temperature.value,
      presencePenalty: presencePenalty.value,
      frequencyPenalty: frequencyPenalty.value,
      tokensValue:tokensValue.value
    });

    const handleInputChange = () => {
      parameterChanged.value = { ...parameterChanged.value, tokensValue: tokensValue.value }
      emit("updateParameter", parameterChanged.value);
    }

    watch(temperature, (newValue) => {
      document.documentElement.style.setProperty(
        "--temperature_value",
        newValue
      );
      parameterChanged.value = { ...parameterChanged.value, temperature: newValue }
      emit("updateParameter", parameterChanged.value);
    });

    watch(presencePenalty, (newValue) => {
      document.documentElement.style.setProperty(
        "--presencePenalty_value",
        newValue
      );
      parameterChanged.value = { ...parameterChanged.value, presencePenalty: newValue }
      emit("updateParameter", parameterChanged.value);
    });

    watch(frequencyPenalty, (newValue) => {
      document.documentElement.style.setProperty(
        "--frequencyPenalty_value",
        newValue
      );
      parameterChanged.value = { ...parameterChanged.value, frequencyPenalty: newValue }
      emit("updateParameter", parameterChanged.value);
    });

    return {
      temperature,
      presencePenalty,
      frequencyPenalty,
      tokensValue,
      parameterChanged,
      handleInputChange,
    };
  },
};
</script>
<style lang="scss">
.setting-popover {
  height: 225px;
  margin-top: 5%;
}
.settingIcon {
  width: 2%;
  outline: none;
  cursor: pointer;
}
.setParm {
  .parm {
    width: 95%;
    margin: 10px auto;

    .slider {
      width: 100%;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      border: 1px solid rgb(202, 199, 199);
      border-radius: 5px;
    }

    .slider::-webkit-slider-thumb {
      background-color: rgb(20, 153, 242);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      width: 15px;
      height: 15px;
      -webkit-appearance: none;
      appearance: none;
    }

    .first {
      background: linear-gradient(
        to right,
        rgb(20, 153, 242) 0%,
        rgb(20, 153, 242) calc((var(--temperature_value) - 0) / (2 - 0) * 100%),
        rgb(202, 199, 199) calc((var(--temperature_value) - 0) / (2 - 0) * 100%),
        rgb(202, 199, 199) 100%
      );
    }

    .second {
      background: linear-gradient(
        to right,
        rgb(20, 153, 242) 0%,
        rgb(20, 153, 242)
          calc((var(--presencePenalty_value) - (-2)) / (2 - (-2)) * 100%),
        rgb(202, 199, 199)
          calc((var(--presencePenalty_value) - (-2)) / (2 - (-2)) * 100%),
        rgb(202, 199, 199) 100%
      );
    }

    .third {
      background: linear-gradient(
        to right,
        rgb(20, 153, 242) 0%,
        rgb(20, 153, 242)
          calc((var(--frequencyPenalty_value) - (-2)) / (2 - (-2)) * 100%),
        rgb(202, 199, 199)
          calc((var(--frequencyPenalty_value) - (-2)) / (2 - (-2)) * 100%),
        rgb(202, 199, 199) 100%
      );
    }

    .textInput {
      outline: none;
      width: 60%;
      border-radius: 5px;
      border: 1px solid rgb(143, 141, 141);
      padding-left: 1ch;
    }
  }
}
</style>
