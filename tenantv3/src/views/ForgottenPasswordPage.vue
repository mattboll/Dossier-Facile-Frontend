<template>
  <div class="fr-container">
    <ForgottenPassword @on-forgotten-password="onForgottenPassword" />
    <Modal v-show="isValidModalVisible" @close="closeModal">
      <template v-slot:body>
        <div class="fr-container">
          <div class="fr-grid-row justify-content-center">
            <div class="fr-col-12">
              <p>
                {{ $t("forgottenpasswordpage.mail-sent") }}
              </p>
              <p>
                {{ $t("forgottenpasswordpage.clic-to-confirm") }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { User } from "df-shared-next/src/models/User";
import ForgottenPassword from "df-shared-next/src/Authentification/ForgottenPassword.vue";
import Modal from "df-shared-next/src/components/Modal.vue";
import { ToastService } from "@/services/ToastService";

@Component({
  components: {
    ForgottenPassword,
    Modal,
  },
})
export default class ForgottenPasswordPage extends Vue {
  isValidModalVisible = false;
  MAIN_URL = `//${import.meta.env.VITE_MAIN_URL}`;

  onForgottenPassword(user: User) {
    if (user.email) {
      this.$store.dispatch("resetPassword", user).then(
        () => {
          this.isValidModalVisible = true;
        },
        () => {
          ToastService.error("forgottenpasswordpage.email-not-found");
        }
      );
    }
  }

  closeModal() {
    this.isValidModalVisible = false;
    window.location.replace(this.MAIN_URL);
  }
}
</script>
