<template>  
  <div>  
    <div class="flex justify-between">  
      <label class="block text-sm font-medium leading-6 text-gray-500">{{ label }}</label>  
    </div>  
    <input type="text" class="block w-full rounded-md bg-zinc-900 border-0 py-1.5 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6" :placeholder="placeholder" :value="value" @input="handleInput">  
  </div>  
</template>  
  
<script>  
  
export default {  
  name: 'TextField',  
  props: {  
    label: {  
      type: String,  
      required: true  
    },  
    placeholder: {  
      type: String,  
      default: ''  
    },  
    value: {  
      type: String,  
      required: true  
    },  
    onChange: {  
      type: Function,  
      required: true  
    }  
  },  
  methods: {  
    handleInput(event) {  
      this.onChange(event.target.value);  
    }  
  }  
};  
</script>  