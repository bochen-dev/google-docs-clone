<template>
  <router-view />
</template>

<script>
import { v4 as uuidV4 } from "uuid";

export default {
  name: "Home",
  data() {
    return {

    };
  },
  beforeRouteEnter(to, from, next) {
    if (to.params.id) return next();

    next({
      name: "Document",
      params: {
        id: uuidV4(),
      },
    });
  },
};
</script>

<style>
</style>