<template>
  <div class="footer">
    <hr >
    <div class="footer__info">
      <div>© {{ new Date().getFullYear() }} Project by <b>Sergey Kalabin</b> | Mob: 89271646167</div>
      <div class="footer__social">
        <NuxtLink to="#">
          <Icon name="icons:li" size="30px" />
        </NuxtLink>
        <NuxtLink to="#">
          <Icon name="icons:fb" size="30px" />
        </NuxtLink>
        <NuxtLink to="#">
          <Icon name="icons:in" size="30px" />
        </NuxtLink>
        <NuxtLink to="#">
          <Icon name="icons:tw" size="30px" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.footer {
  padding: 0 16px;
  margin: 0 auto;
  max-width: 1248px;
  display: flex;
  flex-direction: column;
  gap: 50px;
}
.footer hr {
  border: none;
  border-bottom: 1px solid var(--color-gray);
  height: 1px;
}
.footer__top a:hover {
  fill: red;
}

.footer__info {
  display: flex;
  justify-content: space-between;
}

.footer__social {
  display: flex;
  gap: 20px;
}

.footer__social a {
  color: var(--color-dark-gray);
}

.footer__social a:hover {
  color: var(--color-dark);
}
.footer__form {
  position: relative;
}

.footer__form input {
  min-width: 380px;
}
.footer__subscribe {
  position: absolute;
  right: 0;
  top: 10px;
  background: none;
  border: none;
}
</style>
