<template>
  <v-gouv-fr-modal>
    <template v-slot:button>
      {{ t("troubleshootingmodal.more-information") }}
    </template>
    <template v-slot:title>
      {{ t("troubleshootingmodal.more-information") }}
    </template>
    <template v-slot:content>
      <p>
        <slot></slot>
      </p>
    </template>
  </v-gouv-fr-modal>
</template>

<script setup lang="ts">
import VGouvFrModal from "df-shared-next/src/GouvFr/v-gouv-fr-modal/VGouvFrModal.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

</script>
