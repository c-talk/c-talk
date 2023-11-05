<script setup lang="ts"></script>
<template>
  <div class="index-page">
    <div class="flex">
      <div class="book-cover"></div>
      <div class="flex-1"></div>
    </div>
    <h1>Default Page</h1>
    <p>This is the default page.</p>
  </div>
</template>

<style scoped lang="scss">
.index-page {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
</style>

<route lang="yaml">
meta:
  layout: plain
</route>
