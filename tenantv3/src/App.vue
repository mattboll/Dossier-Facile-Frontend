<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import useTenantStore from './stores/tenant-store';
import { computed } from 'vue';
import TenantSkipLinks from './components/TenantSkipLinks.vue';
import TenantMenu from './components/TenantMenu.vue';
import MyHeader from "./components/Header.vue";
import Footer from "df-shared-next/src/Footer/Footer.vue";
import DeleteAccount from './components/DeleteAccount.vue';
import Announcement from 'df-shared-next/src/components/Announcement.vue';
import FollowSocials from 'df-shared-next/src/Footer/FollowSocials.vue';

const store = useTenantStore();
const router = useRouter();

  const isFunnel = computed(() => store.isFunnel);
  const isLoggedIn = computed(() => store.isLoggedIn);

  const OWNER_URL = `//${import.meta.env.VITE_OWNER_URL}`;

  function onLogout() {
    store.logout(true);
  }

  function onLoginTenant() {
    router.push("/login");
  }

  function onCreateOwner() {
    window.location.href = OWNER_URL;
  }
</script>

<template>
    <TenantSkipLinks></TenantSkipLinks>
    <MyHeader
      :logged-in="isLoggedIn"
      @on-login-tenant="onLoginTenant"
      @on-create-owner="onCreateOwner"
      @on-logout="onLogout"
      :showAccessibility="isFunnel"
    >
      <TenantMenu />
    </MyHeader>
    <div id="content">
      <DeleteAccount></DeleteAccount>
      <Announcement></Announcement>
      <main role="main">
        <div class="page">
          <RouterView />
        </div>
        <FollowSocials v-if="!isFunnel" />
      </main>
    </div>
    <Footer v-if="!isFunnel" />
</template>

<style lang="scss">
@import "df-shared-next/src/scss/_main.scss";
@import 'vue3-toastify/dist/index.css';

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#content {
  flex: auto;
  display: flex;
  flex-direction: column;
}

.page {
  flex: auto;
  min-height: 300px;
  display: flex;
  align-items: stretch;
}
</style>
