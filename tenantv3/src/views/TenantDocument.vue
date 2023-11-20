<template>
  <ProfileContainer :step="2">
    <UploadDocuments :substep="getStep()"></UploadDocuments>
  </ProfileContainer>
</template>

<script setup lang="ts">
import UploadDocuments from "../components/UploadDocuments.vue";
import ProfileContainer from "../components/ProfileContainer.vue";
import { onBeforeUnmount, onMounted } from "vue";

  onMounted(() => {
    window.Beacon("init", "e9f4da7d-11be-4b40-9514-ac7ce3e68f67");
  })

  onBeforeUnmount(() => {
    window.Beacon("destroy");
  })

  function getStep() {
    return 0
    // TODO
    // return Number(this.$route.params.substep) || 0;
  }
</script>

<style lang="scss" scoped>
h4 {
  margin: 0;
}
</style>
