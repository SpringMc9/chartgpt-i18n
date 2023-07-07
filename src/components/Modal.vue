<template>
  <TransitionRoot :show="open">
    <Dialog as="div" class="relative z-10" :initialFocus="cancelButtonRef" @close="onClose">
      <TransitionChild as="Fragment" enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
        leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto text-white">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="Fragment" enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <slot></slot>
              <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button type="button"
                  class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                  @click="onConfirm">
                  Translate
                </button>
                <button type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                  @click="onClose" ref="cancelButtonRef">
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script>
import { TransitionRoot, Dialog, TransitionChild } from "@headlessui/vue";
import { ref } from "vue";

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Modal",
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    onClose: {
      type: Function,
      required: true,
    },
    onConfirm: {
      type: Function,
      required: true,
    },
  },
  components: {
    TransitionRoot,
    Dialog,
    TransitionChild,
  },
  setup(props) {
    const cancelButtonRef = ref(null);

    return {
      cancelButtonRef,
      ...props,
    };
  },
};
</script>
