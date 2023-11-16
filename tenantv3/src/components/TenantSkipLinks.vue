<template>
  <SkipLinks :links="mySkipLinks"></SkipLinks>
</template>

<script setup lang="ts">
import SkipLinks from "df-shared-next/src/components/SkipLinks.vue";
import { SkipLink } from "df-shared-next/src/models/SkipLink";
import useTenantStore from './stores/tenant-store';

const store = useTenantStore();
const mySkipLink = computed(() => store.skipLinks);
</script>

<style scoped lang="scss"></style>
