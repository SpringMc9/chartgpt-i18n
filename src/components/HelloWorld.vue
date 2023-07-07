<template>
  <div class="hello">
    <p>
      You config will only be used by yourself and stored in your localStorage.
    </p>
    <div class="select-box">
      <select class="select" v-model="lang">
        <option
          v-for="option in configSelect"
          :value="option.value"
          :key="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <p>API Key</p>
    <input class="input-openai" :value="value" @input="handleInput"/>
    <div class="button-box">
      <button @click="saveConfig()">Save Config</button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "HelloWorld",
  setup() {
    const configSelect = [
      { value: "openai", label: "openai" },
    ];

    const config = {
        apiKey: "your-key",
        serviceProvider: "azure",
        model: "gpt-3.5-turbo-0301",
    };

    const lang = ref("azure");
    const value = ref("");

    const handleInput = (event) => {
      value.value = event.target.value;
    };

    const saveConfig = () => {
      // 获取选择框的值
      config.apiKey = value.value
      config.serviceProvider = lang.value
      localStorage.setItem("config", JSON.stringify(config));
      window.alert("openai KPI已保存至localStorage");
    };

    return {
      lang,
      value,
      config,
      configSelect,
      saveConfig,
      handleInput
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.hello {
  display: inline-block;
  flex-direction: row;
  justify-content: center;
  text-align: left;

  .select-box {
    .select {
      width: 100px;
      height: 33px;
      font-size: 16px;
      border-radius: 7px;
      border: none;
      outline: none;
    }
  }
  .input-openai {
    width: 1212px;
    height: 30px;
    border-radius: 7px;
    margin-top: -8px;
    margin-bottom: 10px;
    border: none;
    outline: none;
  }
  .button-box button {
    width: 130px;
    height: 33px;
    border-radius: 7px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background-color: rgb(20, 153, 242);
    border: 2px solid rgb(20, 153, 242);
  }
}
</style>
