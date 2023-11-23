<template>
  <!-- <validation-provider :rules="getValidationRules()" v-slot="{ errors, valid }"> -->
  <!-- :class="errors[0] ? 'fr-input-group--error' : ''" -->
  <div class="fr-input-group">
    <FieldLabel :required="required" :for-input="name">
      {{ fieldLabel }}
    </FieldLabel>
    <div class="field-with-button fr-input-wrap">
      <!-- :class="{
            'fr-input--valid': valid,
            'fr-input--error': errors[0],
          }" -->
      <input
        v-if="!textarea"
        :id="name"
        type="text"
        v-bind:value="modelValue"
        v-on:input="updateModel($event)"
        :name="name"
        class="validate-required form-control fr-input"
        :disabled="disabled"
      />
      <!-- :class="{
            'fr-input--valid': valid,
            'fr-input--error': errors[0],
          }" -->
      <textarea
        v-else
        :id="name"
        type="text"
        :value="modelValue"
        v-on:input="emit('update:modelValue', $event)"
        :name="name"
        class="validate-required form-control fr-input"
        :disabled="disabled"
        maxlength="2000"
        rows="4"
      />
      <div class="fr-ml-1w" v-if="$slots.right">
        <slot name="right"></slot>
      </div>
    </div>
    <!-- <span class="fr-error-text" v-if="errors[0]">
        {{ t(errors[0]) }}
      </span> -->
  </div>
  <!-- </validation-provider> -->
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import FieldLabel from "./FieldLabel.vue";
// TODO
// import { ValidationProvider } from "vee-validate";

const { t } = useI18n();

const emit = defineEmits(["update:modelValue"]);

const props = withDefaults(
  defineProps<{
    modelValue: string;
    fieldLabel: string;
    name: string;
    validationRules?: string;
    required?: boolean;
    disabled?: boolean;
    textarea?: boolean;
  }>(),
  {
    validationRules: "",
    required: false,
    disabled: false,
    textarea: false,
  }
);

function getValidationRules(): string {
  const requiredRule = "required";
  if (props.required && !props.validationRules.includes(requiredRule)) {
    return [props.validationRules, requiredRule]
      .filter((rule) => rule !== "")
      .join("|");
  }
  return props.validationRules;
}

function updateModel(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}
</script>

<style scoped lang="scss">
.field-with-button {
  display: flex;
  justify-content: space-between;
}
</style>
