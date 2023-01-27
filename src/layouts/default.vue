<script lang="ts" setup></script>

<template>
  <n-layout class="default-layout flex w-full h-full flex-col">
    <n-layout-header><DefaultHeader /></n-layout-header>
    <n-layout-content class="flex-1" content-style="padding: 24px;">
      <RouterView />
    </n-layout-content>
    <n-layout-footer inverted>成府路</n-layout-footer>
  </n-layout>
</template>

<style lang="scss">
.default-layout {
  .n-layout-scroll-container {
    display: flex;
    flex-direction: column;
  }
}
</style>
