<template>
  <span>
    <button
      type="button"
      class=""
      @click="handleShowChange"
    >
      Translate to files
    </button>
    <Modal :open="show" @close="show = false" @confirm="downloadFiles">
      <fieldset>
        <legend class="text-base font-semibold leading-6 text-gray-50">
          Languages
        </legend>
        <div
          class="mt-4 divide-y divide-gray-600 border-t border-b border-gray-600"
        >
          <div
            v-for="(lang, personIdx) in intlLanguages"
            :key="personIdx"
            class="relative flex items-start py-2"
          >
            <div class="min-w-0 flex-1 text-sm leading-6">
              <label
                :for="`person-${lang.value}`"
                class="select-none font-medium text-gray-50"
              >
                {{ lang.label }} | {{ lang.value }}
              </label>
            </div>
            <div class="ml-3 flex h-6 items-center">
              <input
                :checked="selectedLangs.includes(lang.value)"
                :id="`person-${lang.value}`"
                :name="`person-${lang.value}`"
                :value="lang.value"
                type="checkbox"
                class="h-4 w-4 rounded bg-gray-900 border-gray-500 text-indigo-600 focus:ring-indigo-600"
                @change="handleLangChange"
              />
            </div>
          </div>
        </div>
      </fieldset>
      <div v-if="loading" class="flex justify-center py-2">
        <Spinner />
        <h2 class="text-base font-white">Generate locale files</h2>
      </div>
    </Modal>
  </span>
</template>

<script>
import { ref } from "vue";
import Modal from "./Modal";
import { intlLanguages } from "../type/type";
import {
  downloadFileFromBlob,
  exportLocalFiles,
  makeLocalesInZip,
} from "../services/translatefiles";

export default {
  name:"ExportFiles",
  components: {
    Modal,
  },
  methods: {
    handleLangChange(e) {
      const { value, checked } = e.target;
      if (checked) {
        this.selectedLangs.value = [...this.selectedLangs.value, value];
      } else {
        this.selectedLangs.value = this.selectedLangs.value.filter(
          (lang) => lang !== value
        );
      }
    },
    handleShowChange() {
      this.show = true;
    }
  },
  setup(props) {
    const originalContent = ref(props.originalContent);
    const show = ref(false);
    const selectedLangs = ref([]);

    const compress = (content) => {
      try {
        return JSON.stringify(JSON.parse(content.value));
      } catch (error) {
        throw new Error("json is not valid");
      }
    };

    async function downloadFiles() {
      try {
        const compressedContent = compress(originalContent.value);
        const res = await exportLocalFiles(
          compressedContent,
          selectedLangs.value,
          "json"
        );
        const file = await makeLocalesInZip(res, "json");
        downloadFileFromBlob(file, "locales.zip");
      } catch (error) {
        console.log(error);
      } finally {
        show.value = false;
      }
    }

    return {
      show,
      selectedLangs,
      downloadFiles,
      intlLanguages,
    };
  },
};
</script>
