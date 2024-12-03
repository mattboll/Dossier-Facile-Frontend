<template>
  <div class="fr-container">
    <div class="fr-grid-row justify-content-center">
      <div class="fr-col-12">
        <template v-if="file?.preview">
          <div>preview : {{ file?.preview }}</div>
          <AuthImage :src="file?.preview || ''" :alt="t('showdoc.preview')" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DfFile } from 'df-shared-next/src/models/DfFile'
import AuthImage from 'df-shared-next/src/components/AuthImage.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ file: DfFile }>()
</script>
