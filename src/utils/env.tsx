export function isTauri() {
  // @ts-expect-error Tauri 环境下会有 window.__TAURI__ 对象
  return !!window.__TAURI__
}
