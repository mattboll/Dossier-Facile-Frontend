<template>
  <div>
    <NakedCard class="fr-p-md-5w fr-mb-2w">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12">
          <h1 class="fr-h6">
            {{ $t("coupleinformation.partner-name-title") }}
          </h1>
        </div>
        <div class="fr-col-12 fr-mb-3w">
          <validation-provider rules="required|only-alpha" v-slot="{ errors }">
            <div
              class="fr-input-group"
              :class="errors[0] ? 'fr-input-group--error' : ''"
            >
              <FieldLabel :required="true">
                {{ $t("coupleinformation.spouseLastName") }}
              </FieldLabel>
              <input
                v-model="coTenant.lastName"
                class="form-control validate-required fr-input"
                :class="{
                  'fr-input--error': errors[0],
                }"
                name="coTenantLastName"
                type="text"
                @input="handleInput"
                :disabled="disableNameFields"
              />
              <span
                class="fr-error-text"
                v-if="errors[0] && errors[0] !== 'none'"
                >{{ $t(errors[0]) }}</span
              >
            </div>
          </validation-provider>
        </div>
        <div class="fr-col-12 fr-mb-3w">
          <validation-provider rules="required|only-alpha" v-slot="{ errors }">
            <div
              class="fr-input-group"
              :class="errors[0] ? 'fr-input-group--error' : ''"
            >
              <FieldLabel :required="true">
                {{ $t("coupleinformation.spouseFirstName") }}
              </FieldLabel>
              <input
                v-model="coTenant.firstName"
                class="validate-required form-control fr-input"
                :class="errors[0] ? 'fr-input--error' : ''"
                name="firstName"
                type="text"
                @input="handleInput"
                :disabled="disableNameFields"
              />
              <span
                class="fr-error-text"
                v-if="errors[0] && errors[0] !== 'none'"
                >{{ $t(errors[0]) }}</span
              >
            </div>
          </validation-provider>
        </div>
      </div>
    </NakedCard>
    <NakedCard class="fr-p-md-5w fr-mb-2w">
      <div class="fr-grid-row fr-grid-row--center">
        <div class="fr-col-12">
          <h1 class="fr-h6">
            {{ $t("coupleinformation.partner-email-title") }}
          </h1>
          <v-gouv-fr-modal>
            <template v-slot:button>
              <span class="small-font">{{
                $t("coupleinformation.more-information")
              }}</span>
            </template>
            <template v-slot:title>
              {{ $t("coupleinformation.more-information") }}
            </template>
            <template v-slot:content>
              <p>
                <CoupleInformationHelp></CoupleInformationHelp>
              </p>
            </template>
          </v-gouv-fr-modal>
        </div>
        <div class="fr-col-12 fr-mt-3w fr-mb-3w">
          <validation-provider
            v-slot="{ errors }"
            :rules="{ email: true, custom: user.email }"
          >
            <div
              class="fr-input-group"
              :class="errors[0] ? 'fr-input-group--error' : ''"
            >
              <FieldLabel for-input="email">
                {{ $t("coupleinformation.spouseEmail") }}
              </FieldLabel>
              <input
                v-model="coTenant.email"
                class="validate-required form-control fr-input"
                :class="errors[0] ? 'fr-input--error' : ''"
                name="email"
                placeholder="Ex : exemple@exemple.fr"
                type="email"
                @input="handleInput"
                :disabled="disableEmailField"
              />
              <span
                class="fr-error-text"
                v-if="errors[0] && errors[0] !== 'none'"
                >{{ $t(errors[0]) }}</span
              >
            </div>
          </validation-provider>
        </div>
      </div>
    </NakedCard>
    <div
      ref="checkboxauthorize"
      v-if="showCheckBox"
      class="fr-grid-row fr-grid-row--center"
    >
      <div class="fr-col-12 fr-mb-3w fr-mt-3w">
        <validation-provider rules="is" v-slot="{ errors }" class="fr-col-10">
          <div
            class="fr-checkbox-group bg-purple"
            :class="errors[0] ? 'fr-input-group--error' : ''"
          >
            <input
              type="checkbox"
              id="authorize"
              value="false"
              v-model="authorize"
              @change="updateAuthorize()"
            />
            <label
              for="authorize"
              v-html="$t('coupleinformation.acceptAuthor')"
            >
            </label>
            <span class="fr-error-text" v-if="errors[0]">{{
              $t(errors[0])
            }}</span>
          </div>
        </validation-provider>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { extend, ValidationObserver, ValidationProvider } from "vee-validate";
// import { is } from "vee-validate/dist/rules";
// import { mapGetters, mapState } from "vuex";
import { User } from "df-shared-next/src/models/User";
import NakedCard from "df-shared-next/src/components/NakedCard.vue";
import VGouvFrModal from "df-shared-next/src/GouvFr/v-gouv-fr-modal/VGouvFrModal.vue";
import CoupleInformationHelp from "./helps/CoupleInformationHelp.vue";
import FieldLabel from "df-shared-next/src/components/form/FieldLabel.vue";
import { computed, onMounted, ref } from "vue";
import useTenantStore from "@/stores/tenant-store";

// extend("is", {
//   ...is,
//   message: "field-required",
//   validate: (value) => !!value,
// });

// extend("custom", {
//   ...is,
//   message: "same-email-not-valid",
//   validate: (v1, v2: any) => {
//     return v1 !== v2.other;
//   },
// });

const emit = defineEmits(["input"]);

    const store = useTenantStore();
    const user = computed(() => store.user);
    const spouseAuthorize = computed(() => store.spouseAuthorize);

  const coTenant = ref(new User());
  const authorize = ref(false);
  const showCheckBox = ref(false);
  const disableNameFields = ref(false);
  const disableEmailField = ref(false);
const checkboxauthorize = ref(null);

  onMounted(() => {
    if ((user.value.apartmentSharing?.tenants.length || 0) > 1) {
      const partner = user.value.apartmentSharing?.tenants.find((t) => {
        return t.email != user.value.email;
      });
      coTenant.value = partner || coTenant.value;
      if (coTenant.value.firstName || coTenant.value.lastName) {
        disableNameFields.value = true;
      }
      if (coTenant.value.email?.length > 0) {
        disableEmailField.value = true;
        showCheckBox.value = true;
        authorize.value = spouseAuthorize.value;
      }
    }
  })

  function scrollToEnd() {
    // TODO
    // window.scrollTo(0, checkboxauthorize.value?.lastElementChild.offsetTop);
  }

  function handleInput() {
    emit("input", [coTenant.value]);
    if (coTenant.value.email?.length > 0) {
      showCheckBox.value = true;
      // TODO
      // this.$nextTick(function () {
      //   scrollToEnd();
      // });
    } else {
      showCheckBox.value = false;
    }
  }

  function updateAuthorize() {
    store.updateCoupleAuthorize(authorize.value);
  }
</script>

<style scoped lang="scss">
.overflow--hidden {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.icon-btn {
  display: block;
  height: 2.5rem;
  width: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
}

.center-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.round-icon {
  border-radius: 50%;
  background-color: var(--primary);
  padding: 0.25rem;
}

.nowrap {
  flex-wrap: nowrap;
  overflow: auto;
}

.max-content {
  max-width: max-content;
  @media all and (max-width: 420px) {
    max-width: 200px;
  }
}
</style>
