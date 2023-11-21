<template>
  <div>
    <div class="fr-grid-col main-content">
      <div class="fr-mb-3w">
        <div class="fr-grid-row">
          <div class="fr-mr-1v">
            <button @click="decreasePage()">«</button>
          </div>
          <div>
            <input
              v-model.number="page"
              type="number"
              style="width: 2.5rem"
              min="1"
              :max="numPages"
            />
            / {{ numPages }}
          </div>
          <div class="fr-ml-1v">
            <button @click="increasePage()">»</button>
          </div>
        </div>
      </div>
      <div class="pdf-content">
        <div
          v-if="loadedRatio > 0 && loadedRatio < 1"
          style="background-color: green; color: white; text-align: center"
          :style="{ width: loadedRatio * 100 + '%' }"
        >
          {{ Math.floor(loadedRatio * 100) }}%
        </div>
        <pdf
          ref="pdf"
          style="border: 1px solid red"
          :src="src"
          :page="page"
          :rotate="rotate"
          @progress="loadedRatio = $event"
          @error="error"
          @num-pages="numPages = $event"
          @link-clicked="page = $event"
        ></pdf>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import pdf from "vue-pdf";

  const props = defineProps({
    src: String
  });

  const loadedRatio = ref(0);
  const page = ref(1);
  const numPages = ref(0);
  const rotate = ref(0);

  function decreasePage() {
    if (page.value > 1) {
      page.value--;
    }
    if (page.value >= numPages.value) {
      page.value = numPages.value - 1;
    }
  }

  function increasePage() {
    if (page.value < numPages.value) {
      page.value++;
    }
    if (page.value < 1) {
      page.value = 1;
    }
  }

  function error(err: any) {
    console.log(err);
  }
</script>

<style scoped lang="scss">
.main-content {
  width: 768px;
  @media all and (max-width: 992px) {
    width: 95%;
  }
  margin: auto;
}

.pdf-content {
  width: 100%;
}
</style>
