<template>
  <div class="textfield">
    <div class="text-label">
      <label class="text-label-display">{{ label }}</label>
    </div>
    <input
      type="text"
      class="text-input"
      :placeholder="placeholder"
      :value="value"
      @input="handleInput"
    />
  </div>
</template>

<script>
export default {
  name: "TextField",
  props: {
    label: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      required: true,
    },
    onChange: {
      type: Function,
      required: true,
    },
  },
  methods: {
    handleInput(event) {
      this.onChange(event.target.value);
    },
  },
};
</script>
<style scoped lang="scss">
.textfield {
  width: 80%;
  display: flex;
  flex-wrap: wrap;
  .text-label {
    justify-content: unset !important;
    .text-label-display {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 5px;
    }
  }

  .text-input {
    width: 100%;
    height: 30px;
    border-radius: 7px;
    border: none;
    outline: none;
    margin-top: 6px;
    padding-left: 2ch;
  }
}
</style>
