<template>
  <div class="rf-grid-row rf-grid-row--center">
    <div class="col-md-8 col-lg-6">
      <div class="rf-grid-row rf-grid-row--center">
        <div class="rf-col-12">
          <label class="rf-label">{{ $t("spouseEmail") }}</label>
          <validation-provider rules="email" v-slot="{ errors }">
            <div
              class="rf-input-group"
              :class="errors[0] ? 'rf-input-group--error' : ''"
            >
              <input
                v-model="coupleMail"
                class="form-control rf-input"
                name="email"
                placeholder="Ex : exemple@exemple.fr"
                type="email"
                @change="updateCouple()"
                required
              />
              <span class="rf-error-text" v-if="errors[0]">{{
                $t(errors[0])
              }}</span>
            </div>
          </validation-provider>
        </div>
        <div class="rf-col-12 rf-mb-3w">
          <validation-provider rules="is" v-slot="{ errors }" class="rf-col-10">
            <div
              class="rf-input-group"
              :class="errors[0] ? 'rf-input-group--error' : ''"
            >
              <input
                type="checkbox"
                id="authorize"
                value="false"
                v-model="authorize"
                @change="updateCouple()"
              />
              <label for="authorize">{{ $t("acceptAuthor") }}</label>
              <span class="rf-error-text" v-if="errors[0]">{{
                $t(errors[0])
              }}</span>
            </div>
          </validation-provider>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ValidationObserver, ValidationProvider } from "vee-validate";
import { extend } from "vee-validate";
import { email, is } from "vee-validate/dist/rules";
import { mapState } from "vuex";
import { User } from "df-shared/src/models/User";

extend("email", {
  ...email,
  message: "email-not-valid"
});

extend("is", {
  ...is,
  message: "field-required",
  validate: value => !!value
});

@Component({
  components: {
    ValidationProvider,
    ValidationObserver
  },
  computed: {
    ...mapState({
      user: "user"
    })
  }
})
export default class CoupleInformation extends Vue {
  coupleMail = "";
  authorize = false;

  user!: User;

  mounted() {
    if ((this.user.apartmentSharing?.tenants.length || 0) > 1) {
      this.coupleMail =
        this.user.apartmentSharing?.tenants.find(t => {
          return t.email != this.user.email;
        })?.email || "";
    }
  }

  updateCouple() {
    this.$emit("update-couple", this.coupleMail, this.authorize);
  }
}
</script>

<style scoped lang="scss"></style>

<i18n>
{
"en": {
"spouseEmail": "Veuillez renseigner l’adresse email de votre conjoint",
"acceptAuthor": "J’accepte que mon partenaire ait accès à mes documents ainsi qu’à ceux de mon garant le cas échéant une fois que nos deux dossiers auront été validés",
"email-not-valid": "Email not valid",
"field-required": "This field is required"
},
"fr": {
"spouseEmail": "Veuillez renseigner l’adresse email de votre conjoint",
"acceptAuthor": "J’accepte que mon partenaire ait accès à mes documents ainsi qu’à ceux de mon garant le cas échéant une fois que nos deux dossiers auront été validés",
"email-not-valid": "Email non valide",
"field-required": "Ce champ est requis"
}
}
</i18n>
