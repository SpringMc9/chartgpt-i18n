<template>  
  <div>  
    <slot></slot>  
  </div>  
</template>  
  
<script>  
import { defineComponent, ref, provide } from 'vue';  
  
export const NotificationContext = Symbol('NotificationContext');  
  
export default defineComponent({  
  name: 'NotificationProvider',  
  setup() {  
    const show = ref(false);  
    const notification = ref(null);  
  
    const notify = (not, t) => {  
      show.value = true;  
      notification.value = not;  
      setTimeout(() => {  
        show.value = false;  
      }, t);  
    }  
  
    provide(NotificationContext, {  
      notify  
    });  
  
    return {  
      show,  
      notification  
    }  
  }  
});  
</script>  