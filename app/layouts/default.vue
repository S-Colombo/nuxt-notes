<template>
  <div class="layouts-wrapper">
    <LayoutHeader />
    <slot />
    <LayoutFooter />
  </div>
</template>

<style scoped lang="scss">
.layouts-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 1248px;
  min-height: 100dvh;
  margin: 0 auto;
}
</style>
