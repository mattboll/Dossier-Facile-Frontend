<template>
  <div>
    <DocumentDownloader
      :coTenantId="coTenantId"
      :documentsDefinitions="documentsDefinitions"
      documentCategory="PROFESSIONAL"
      dispatchMethodName="saveTenantProfessional"
      typeDocument="typeDocumentProfessional"
      listType="dropDownList"
      @on-change-document="changeDocumentType"
    >
      <template v-slot:title>
        {{ $t("cotenantprofessional.title") }}
      </template>
    </DocumentDownloader>
  </div>
</template>

<script setup lang="ts">
import { DocumentType } from "df-shared-next/src/models/Document";
import { DocumentTypeConstants } from "../share/DocumentTypeConstants";
import DocumentDownloader from "./DocumentDownloader.vue";
import { ref } from "vue";

  const documentsDefinitions = DocumentTypeConstants.PROFESSIONAL_DOCS;

  const props = defineProps<{
    coTenantId: number;
  }>();
  const documentType = ref(new DocumentType());

  function changeDocumentType(docType?: DocumentType) {
    // TODO : documentType est utilisé ??
    if (docType) {
      documentType.value = docType;
    } else {
      documentType.value = new DocumentType();
    }
  }
</script>

<style scoped lang="scss"></style>
