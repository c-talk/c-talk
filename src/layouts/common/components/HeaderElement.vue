<script lang="ts" setup>
import { useThemeVars } from 'naive-ui'
const themeVars = useThemeVars()
</script>
<template>
  <div class="header-element px-2">
    <div class="icon-wrapper">
      <div class="icon">
        <slot name="icon"></slot>
      </div>
    </div>
    <div class="title">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-element {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: v-bind('themeVars.textColor1');
      transition: all 0.1s linear;
    }
  }

  .title {
    font-size: 1.025em;
    font-weight: normal;
    color: v-bind('themeVars.textColor1');
    transition: all 0.1s linear;
  }

  &:hover {
    .title {
      font-weight: bold;
      color: v-bind('themeVars.successColor');
    }

    .icon-wrapper .icon {
      color: v-bind('themeVars.successColor');
    }
  }
}
</style>
