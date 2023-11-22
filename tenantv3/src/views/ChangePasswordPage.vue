<template>
  <div class="fr-container">
    <ChangePassword @on-change-password="onChangePassword" />
  </div>
</template>

<script lang="ts">
import { User } from "df-shared-next/src/models/User";
import { Component, Vue } from "vue-property-decorator";
import ChangePassword from "df-shared-next/src/Authentification/ChangePassword.vue";
import { ToastService } from "@/services/ToastService";

@Component({
  components: {
    ChangePassword,
  },
})
export default class ChangePasswordPage extends Vue {
  onChangePassword(user: User) {
    user.token =
      this.$route.params.token != "null" ? this.$route.params.token : "";
    this.$store.dispatch("changePassword", user).then(
      () => {
        ToastService.success("changepasswordpage.password-update");
        this.$router.push({ name: "Account" });
      },
      (error: any) => {
        if (
          error.response.data.message.includes(
            "password recovery token or is expired"
          )
        ) {
          ToastService.error("changepasswordpage.token-expired");
        } else {
          ToastService.error("changepasswordpage.error");
        }
      }
    );
  }
}
</script>
