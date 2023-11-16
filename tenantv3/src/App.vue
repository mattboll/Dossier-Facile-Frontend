<script setup lang="ts">
import { RouterView } from 'vue-router'
import useTenantStore from './stores/tenant-store';
import { User } from '@sentry/vue';
import { computed } from 'vue';
import TenantSkipLinks from './components/TenantSkipLinks.vue';
import Menu from './components/Menu.vue';
import MyHeader from "df-shared-next/src/Header/Header.vue";
import Footer from "df-shared-next/src/Footer/Footer.vue";

const store = useTenantStore();

  const isFunnel = computed(() => store.isFunnel);
  const user: User = computed(() => store.user);
  const isLoggedIn = computed(() => store.isLoggedIn);

  const OWNER_URL = `//${import.meta.env.VITE_OWNER_URL}`;
  const MAIN_URL = `//${import.meta.env.VITE_MAIN_URL}`;
  const TENANT_URL = `//${import.meta.env.VITE_TENANT_URL}`;

  function onLogout() {
    this.$store.dispatch("logout", this.MAIN_URL);
  }

  function onLoginTenant() {
    this.$router.push("/login");
  }

  function onCreateOwner() {
    window.location.href = this.OWNER_URL;
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
      <Menu />
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

<style>
@import '../node_modules/@gouvfr/dsfr/dist/dsfr/dsfr.min.css';

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
