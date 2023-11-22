<template>
  <div>
    <NakedCard class="fr-p-md-5w">
      <div>
        <h1 class="fr-h6" v-if="isCotenant">
          {{ t("guarantorprofessional.title-cotenant") }}
        </h1>
        <h1 class="fr-h6" v-else>{{ t("guarantorprofessional.title") }}</h1>
        <div class="fr-mt-3w">
          <validation-provider
            rules="select"
            name="professionalDocument"
            v-slot="{ errors, valid }"
          >
            <label v-if="isCotenant">{{
              t("guarantorprofessional.select-label-cotenant")
            }}</label>
            <select
              v-model="professionalDocument"
              class="fr-select fr-mb-3w"
              :class="{
                'fr-select--valid': valid,
                'fr-select--error': errors[0],
              }"
              id="select"
              as="select"
              @change="onSelectChange()"
              aria-label="Select professional situation"
            >
              <option v-for="d in documents" :value="d" :key="d.key">
                {{ t(d.key) }}
              </option>
            </select>
            <span class="fr-error-text" v-if="errors[0]">
              {{ t(errors[0]) }}
            </span>
          </validation-provider>
        </div>
      </div>
    </NakedCard>
    <ConfirmModal
      v-if="isDocDeleteVisible"
      @valid="validSelect()"
      @cancel="undoSelect()"
    >
      <span>{{ t("guarantorprofessional.will-delete-files") }}</span>
    </ConfirmModal>
    <NakedCard
      class="fr-p-md-5w fr-mt-3w"
      v-if="professionalDocument.key || professionalFiles().length > 0"
    >
      <div class="fr-mb-3w">
        <p
          v-html="
            t(
              `explanation-text.${guarantorKey()}.professional.${
                professionalDocument.key
              }`
            )
          "
        ></p>
      </div>
      <AllDeclinedMessages
        class="fr-mb-3w"
        :documentDeniedReasons="documentDeniedReasons"
        :documentStatus="documentStatus"
      ></AllDeclinedMessages>
      <div v-if="professionalFiles().length > 0" class="fr-col-md-12 fr-mb-3w">
        <ListItem
          v-for="(file, k) in professionalFiles()"
          :key="k"
          :file="file"
          @remove="remove(file)"
        />
      </div>
      <div class="fr-mb-3w">
        <FileUpload
          :current-status="fileUploadStatus"
          @add-files="addFiles"
          @reset-files="resetFiles"
        ></FileUpload>
      </div>
    </NakedCard>
  </div>
</template>

<script setup lang="ts">
import DocumentInsert from "../share/DocumentInsert.vue";
import FileUpload from "../../uploads/FileUpload.vue";
import { DocumentType } from "df-shared-next/src/models/Document";
import { UploadStatus } from "df-shared-next/src/models/UploadStatus";
import ListItem from "../../uploads/ListItem.vue";
import { DfFile } from "df-shared-next/src/models/DfFile";
import { DfDocument } from "df-shared-next/src/models/DfDocument";
import { RegisterService } from "../../../services/RegisterService";
import { DocumentTypeConstants } from "../share/DocumentTypeConstants";
import ConfirmModal from "df-shared-next/src/components/ConfirmModal.vue";
import { Guarantor } from "df-shared-next/src/models/Guarantor";
import GuarantorChoiceHelp from "../../helps/GuarantorChoiceHelp.vue";
import NakedCard from "df-shared-next/src/components/NakedCard.vue";
import AllDeclinedMessages from "../share/AllDeclinedMessages.vue";
import { DocumentDeniedReasons } from "df-shared-next/src/models/DocumentDeniedReasons";
import { cloneDeep } from "lodash";
// import { ValidationProvider } from "vee-validate";
import { UtilsService } from "@/services/UtilsService";
import { useI18n } from "vue-i18n";
import useTenantStore from "@/stores/tenant-store";
import { computed, onMounted, ref } from "vue";

const { t } = useI18n();
    const store = useTenantStore();
    const selectedGuarantor = computed(() => {
      return store.selectedGuarantor;
    });


  // @Prop() tenantId?: string;
  // @Prop({ default: false }) isCotenant?: boolean;
  const props = withDefaults(defineProps<{
    tenantId?: string;
    isCotenant?: boolean;
  }>(), {
    tenantId: undefined,
    isCotenant: false,
  });

  const fileUploadStatus = ref(UploadStatus.STATUS_INITIAL);
  const files = ref([] as DfFile[]);
  const uploadProgress: {
    [key: string]: { state: string; percentage: number };
  } = {};
  const professionalDocument = ref(new DocumentType());
  const documents = ref(DocumentTypeConstants.GUARANTOR_PROFESSIONAL_DOCS);
  const isDocDeleteVisible = ref(false);
  const documentDeniedReasons = ref(new DocumentDeniedReasons());

  onMounted(() => {
    updateGuarantorData();
  })

  const documentStatus = computed(() => {
    return guarantorProfessionalDocument()?.documentStatus;
  })

  function guarantorProfessionalDocument() {
    return store.getGuarantorProfessionalDocument;
  }

  function updateGuarantorData() {
    if (selectedGuarantor.value?.documents !== null) {
      const doc = selectedGuarantor.value?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "PROFESSIONAL";
      });
      if (doc !== undefined) {
        const localDoc = documents.value.find((d: DocumentType) => {
          return d.value === doc.subCategory;
        });
        if (localDoc !== undefined) {
          professionalDocument.value = localDoc;
        }
      }
      const ddr = guarantorProfessionalDocument()?.documentDeniedReasons;
      if (ddr) {
        documentDeniedReasons.value= cloneDeep(ddr);
      }
    }
  }

  function onSelectChange() {
    if (selectedGuarantor.value?.documents !== null) {
      const doc = selectedGuarantor.value?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "PROFESSIONAL";
      });
      if (doc !== undefined) {
        isDocDeleteVisible.value =
          (doc.files?.length || 0) > 0 &&
          doc.subCategory !== professionalDocument.value.value;
      }
    }
    return false;
  }

  function undoSelect() {
    if (selectedGuarantor.value?.documents !== null) {
      const doc = selectedGuarantor.value?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "PROFESSIONAL";
      });
      if (doc !== undefined) {
        const localDoc = documents.value.find((d: DocumentType) => {
          return d.value === doc.subCategory;
        });
        if (localDoc !== undefined) {
          professionalDocument.value = localDoc;
        }
      }
    }
    this.isDocDeleteVisible = false;
  }

  async function validSelect() {
    isDocDeleteVisible.value = false;
    if (selectedGuarantor.value?.documents !== null) {
      const doc = selectedGuarantor.value?.documents?.find((d: DfDocument) => {
        return d.documentCategory === "PROFESSIONAL";
      });
      if (doc?.files !== undefined) {
        for (const f of doc.files) {
          if (f.id) {
            await remove(f, true);
          }
        }
      }
    }
  }

  function addFiles(fileList: File[]) {
    const nf = Array.from(fileList).map((f) => {
      return { name: f.name, file: f, size: f.size };
    });
    files.value = [...files.value, ...nf];
    save();
  }
  function resetFiles() {
    fileUploadStatus.value = UploadStatus.STATUS_INITIAL;
  }
  function save() {
    uploadProgress.value = {};
    const fieldName = "documents";
    const formData = new FormData();
    const newFiles = files.value.filter((f) => {
      return !f.id;
    });
    if (!newFiles.length) return;

    if (
      professionalDocument.value.maxFileCount &&
      professionalFiles().length > professionalDocument.value.maxFileCount
    ) {
      // TODO
      // Vue.toasted.global.max_file({
      //   message: this.$i18n.t("max-file", [
      //     this.professionalFiles().length,
      //     this.professionalDocument.maxFileCount,
      //   ]),
      // });
      files.value = [];
      return;
    }
    Array.from(Array(newFiles.length).keys()).forEach((x) => {
      const f: File = newFiles[x].file || new File([], "");
      formData.append(`${fieldName}[${x}]`, f, newFiles[x].name);
    });

    formData.append(
      "typeDocumentProfessional",
      professionalDocument.value.value
    );

    fileUploadStatus.value = UploadStatus.STATUS_SAVING;
    if (store.guarantor.id) {
      formData.append("guarantorId", store.guarantor.id.toString());
    }
    if (props.tenantId) {
      formData.append("tenantId", props.tenantId);
    }

    // TODO
    // const loader = this.$loading.show();
    store
      .saveGuarantorProfessional(formData)
      .then(() => {
        files.value = [];
        fileUploadStatus.value = UploadStatus.STATUS_INITIAL;
        // TODO
        // Vue.toasted.global.save_success();
      })
      .catch((err) => {
        fileUploadStatus.value = UploadStatus.STATUS_FAILED;
        UtilsService.handleCommonSaveError(err);
      })
      .finally(() => {
        // TODO
        // loader.hide();
      });
  }

  function professionalFiles() {
    const newFiles = files.value.map((f) => {
      return {
        subCategory: professionalDocument.value.value,
        id: f.id,
        name: f.name,
        size: f.size,
      };
    });
    const existingFiles =
      store.getGuarantorDocuments?.find((d: DfDocument) => {
        return d.documentCategory === "PROFESSIONAL";
      })?.files || [];
    return [...newFiles, ...existingFiles];
  }

  async function remove(file: DfFile, silent = false) {
    if (file.id) {
      await RegisterService.deleteFile(file.id, silent);
    } else {
      const firstIndex = files.value.findIndex((f) => {
        return f.name === file.name && !f.path;
      });
      files.value.splice(firstIndex, 1);
    }
  }

  function guarantorKey() {
    if (props.tenantId != null) {
      return "cotenant-guarantor";
    }
    return "guarantor";
  }
</script>

<style scoped lang="scss"></style>
