<template>
  <div class="home">
    <v-container fill-height fluid>
      <v-row align="center" justify="center">
        <v-col cols="12"
          ><div style="overflow: hidden; max-height: 100%; min-height: 100%">
            <RectangleSVG /></div
        ></v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import RectangleSVG from "@/components/svg_canvas";
export default {
  name: "Home",
  components: { RectangleSVG },
};
</script>

<style>
</style>
