<template>
  <v-app>
    <v-app-bar app color="primary" dark id="main-nav">
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          style="cursor: pointer"
          contain
          :src="logo"
          transition="scale-transition"
          width="40"
          @click="to()"
        />
      </div>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="to('erkul')">
            <v-icon>mdi-sword</v-icon>
          </v-btn>
        </template>
        <span>Erkul.games</span>
      </v-tooltip>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" @click="to('sctools')">
            <v-icon>mdi-space-station</v-icon>
          </v-btn>
        </template>
        <span>starcitizen.tools</span>
      </v-tooltip>

      <v-spacer></v-spacer>

      <v-icon class="draggable">mdi-drag-vertical</v-icon>
    </v-app-bar>
    <v-main> </v-main>
  </v-app>
</template>

<script>
import path from "path";
import { ipcRenderer } from "electron";

export default {
  name: "App",

  data: () => ({
    tab: null,
    currentPage: null,
    previousPage: null,
    pages: {
      erkul: {
        src: "https://www.erkul.games/",
      },
      sctools: {
        src: "https://starcitizen.tools/",
      },
    },
  }),

  created() {
    this.send("app_version");
  },

  mounted() {},

  components: {},

  computed: {
    logo() {
      return path.join(process.env.BASE_URL, "icons/logo.png");
    },
  },

  methods: {
    send(s, a) {
      ipcRenderer.send(s, a);
    },
    to(to) {
      if (to) {
        if (to == "erkul")
          this.send("resize-window", { width: 1017, height: 600 });
        else if (to == "sctools")
          this.send("resize-window", { width: 1017, height: 600 });
        else this.send("resize-window", { height: 400, width: 400 });
      } else this.send("resize-window");
      this.previousPage = this.currentPage;
      this.currentPage = to;

      if (to)
        this.send("open-window", { src: this.pages[to] && this.pages[to].src });
    },
  },
};
</script>
<style>
.draggable {
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

*::-webkit-scrollbar {
  width: 5px;
}

*::-webkit-scrollbar-track {
  background: #ddd;
}

*::-webkit-scrollbar-thumb {
  background: #666;
  height: 10px;
}

body::-webkit-scrollbar {
  display: none !important;
}

.draggable-wrap {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 60px;
  height: 100%;
  cursor: pointer;
}
</style>
