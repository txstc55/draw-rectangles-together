import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const drawingStore = {
  state: {},
  mutations: {},
  actions: {},
  modules: {},
};

const messageStore = {
  state: {},
  mutations: {},
  actions: {},
  modules: {},
};

export default new Vuex.Store({
  modules: {
    draw: drawingStore,
    message:messageStore
  }
})