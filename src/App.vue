<template>
  <nav>
    <router-link to="/">Translate</router-link>
  </nav>
  <router-view/>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #EAF6FF;
  min-height: 98vh;
}

nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    font-size: 30px;
  }
}
.el-popover {
  height: 600px;
  overflow-y: auto;
  margin-top: 20px;
}
.select option:hover {
  /* 修改鼠标停留在 option 元素时的样式 */
  background-color: #dc1e1e;
  cursor: pointer;
}
</style>
