<template>
  <div>
    <ValidationObserver v-slot="{ validate }">
      <form name="form" @submit.prevent="validate().then(sendFile)">
        <div v-if="!hasErrors()">
          <NakedCard class="fr-p-md-5w fr-mb-3w">
            <h1 class="fr-h6">{{ t("validatefile.title") }}</h1>
            <p>{{ getCheckboxInstructions() }}</p>

            <validation-provider rules="isvalid" v-slot="{ errors }">
              <div
                class="fr-checkbox-group bg-purple fr-mb-3w"
                :class="errors[0] ? 'fr-checkbox-group--error' : ''"
              >
                <input
                  type="checkbox"
                  id="declaration"
                  value="false"
                  v-model="declaration"
                />
                <label for="declaration">
                  <span v-html="t('validatefile.declaration')"></span>
                </label>
                <span class="fr-error-text" v-if="errors[0]">{{
                  t(errors[0])
                }}</span>
              </div>
            </validation-provider>
            <div v-if="hasGuarantors()">
              <validation-provider rules="isvalid" v-slot="{ errors }">
                <div
                  class="fr-checkbox-group bg-purple fr-mb-3w"
                  :class="errors[0] ? 'fr-checkbox-group--error' : ''"
                >
                  <input
                    type="checkbox"
                    id="declaration2"
                    value="false"
                    v-model="declaration2"
                  />
                  <label for="declaration2">{{
                    user.guarantors.length > 1
                      ? t("validatefile.declaration2-plural")
                      : t("validatefile.declaration2")
                  }}</label>
                  <span class="fr-error-text" v-if="errors[0]">{{
                    t(errors[0])
                  }}</span>
                </div>
              </validation-provider>
            </div>
          </NakedCard>

          <div v-if="user.tenantType === 'CREATE'">
            <NakedCard class="fr-px-5w fr-py-3w fr-mb-2w">
              <validation-provider rules="isvalid" v-slot="{ errors }">
                <div
                  class="fr-input-group"
                  :class="errors[0] ? 'fr-input-group--error' : ''"
                >
                  <p>
                    <label for="precision" class="fr-label">
                      {{ t("validatefile.precision") }}
                    </label>
                    <textarea
                      id="precision"
                      :placeholder="t('validatefile.placeholder')"
                      type="text"
                      maxlength="2000"
                      rows="3"
                      v-model="precision"
                      name="precision"
                      class="validate-required form-control fr-input"
                    />
                    <span>{{ precision.length }} / 2000</span>
                    <span class="fr-error-text" v-if="errors[0]">{{
                      t(errors[0])
                    }}</span>
                  </p>
                </div>
              </validation-provider>
            </NakedCard>
          </div>
        </div>
        <ProfileFooter
          @on-back="goBack()"
          :disabled="hasErrors()"
          :nextLabel="t('validatefile.validate')"
        ></ProfileFooter>
      </form>
      <div v-if="hasErrors()">
        <NakedCard class="fr-px-5w fr-py-3w">
          <div>
            <h6 class="fr-h6 color--secondary">
              {{ t("validatefile.validation-error-title") }}
            </h6>
            <p>
              {{ t("validatefile.validation-error-description") }}
            </p>
          </div>
        </NakedCard>
        <FileErrors></FileErrors>
      </div>
    </ValidationObserver>
  </div>
</template>

<script setup lang="ts">
import ProfileFooter from "./footer/ProfileFooter.vue";
import FileErrors from "./FileErrors.vue";
import NakedCard from "df-shared-next/src/components/NakedCard.vue";
import { useLoading } from 'vue-loading-overlay';
import useTenantStore from "@/stores/tenant-store";
import { computed, onMounted, ref } from "vue";
import type { Guarantor } from "df-shared-next/src/models/Guarantor";
import { ToastService } from "@/services/ToastService";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

// extend("isvalid", {
//   ...is,
//   message: "validatefile.require-accept",
//   validate: (value) => !!value,
// });

const { t } = useI18n();

    const store = useTenantStore();
    const user = computed(() => store.user);
    const emit = defineEmits(["on-back"]);

    const router = useRouter();

  const precision = ref("");
  const declaration = ref(false);
  const declaration2 = ref(false);

  onMounted(() => {
    if (user.value.honorDeclaration) {
      declaration.value = true;
      declaration2.value = true;
    }
    precision.value = user.value?.clarification || "";
  })

  function sendFile() {
    if (!canValidate()) {
      window.scrollTo(0, 800);
      return;
    }

    if (
      user.value.status === "VALIDATED" &&
      precision.value === user.value?.clarification
    ) {
      router.push("/account");
      return;
    }
    const $loading = useLoading({});
    const loader = $loading.show();
    const params: any = {
      honorDeclaration: true,
    };
    if (user.value.tenantType === "CREATE") {
      params.clarification = precision.value;
    }
    store
      .validateFile(params)
      .then(() => {
          store.loadUser().then(() => {
            router.push("/account");
          });
      })
      .catch(() => {
        ToastService.error();
      })
      .finally(() => {
        loader.hide();
      });
  }

  function goBack() {
    emit("on-back");
  }

  function hasErrors() {
    return !store.allDocumentsFilled || ! store.allNamesFilled;
  }

  function canValidate() {
    return declaration.value && (!hasGuarantors() || declaration2.value);
  }

  function getCheckboxInstructions() {
    return hasGuarantors()
      ? t("validatefile.read")
      : t("validatefile.read-no-guarantor");
  }

  function hasGuarantors() {
    return (
      user.value.guarantors.length > 0 &&
      user.value.guarantors.findIndex((g: Guarantor) => {
        return g.typeGuarantor !== "ORGANISM";
      }) >= 0
    );
  }
</script>
