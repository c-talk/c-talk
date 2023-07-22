<script lang="ts" setup>
import { useThemeVars } from 'naive-ui'
import { WebviewWindow } from '@tauri-apps/api/window'
const themeVars = useThemeVars()

const openAboutWindow = () => {
  console.log('openAboutWindow')
  new WebviewWindow('About', {
    url: '/about',
    center: true,
    closable: true,
    focus: true,
    height: 480,
    width: 640,
    maximizable: false,
    resizable: false,
    title: '关于'
  })
}
</script>

<template>
  <div class="global-header flex w-full py-2">
    <HeaderElement>
      <template #icon>
        <icon-fluent-document-add-48-regular width="2.75em" height="2.75em" />
      </template>
      <span>导入</span>
    </HeaderElement>
    <HeaderElement>
      <template #icon>
        <icon-fluent-shapes-48-regular width="2.75em" height="2.75em" />
      </template>
      <span>转换</span>
    </HeaderElement>
    <HeaderElement>
      <template #icon>
        <icon-fluent-diversity-48-regular width="2.75em" height="2.75em" />
      </template>
      <span>策略</span>
    </HeaderElement>

    <!-- 中间的空白 -->
    <div class="flex-1"></div>

    <HeaderElement>
      <template #icon>
        <icon-fluent-settings-48-regular width="2.75em" height="2.75em" />
      </template>
      <span>设置</span>
    </HeaderElement>
    <HeaderElement @click="openAboutWindow">
      <template #icon>
        <icon-fluent-question-circle-48-regular
          width="2.75em"
          height="2.75em"
        />
      </template>
      <span>关于</span>
    </HeaderElement>
    <HeaderElement>
      <template #icon>
        <icon-fluent-thumb-like-48-regular width="2.75em" height="2.75em" />
      </template>
      <span>赞助</span>
    </HeaderElement>
  </div>
  <div class="divider w-full h-1px mt-1"></div>
</template>

<style lang="scss" scoped>
.divider {
  background-color: v-bind('themeVars.dividerColor');
}
</style>
