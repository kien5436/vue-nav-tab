<script>
import { onActivated, onMounted } from "vue";
import { onTabActivated, onTabDeactivated } from "../../lib";

export default {
  name: "HelloWorld",
  props: {
    msg: String,
    tabGroup: String,
  },
  setup(props) {

    // onTabActivated(props.tabGroup, (currentTab) => {

    //   console.debug("HelloWorld.vue: onTabActivated", currentTab.id);
    // });

    // onTabDeactivated(props.tabGroup, (lastTab) => {

    //   console.debug("HelloWorld.vue: onTabDeactivated", lastTab.id);
    // });
  },
};
</script>

<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <input type="checkbox">
  </div>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>