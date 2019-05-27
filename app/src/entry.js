import Vue from 'vue'
import App from './App.vue'
import Zutre from 'zutre';

import "zutre/dist/zutre.css";
import "video.js/dist/video-js.css";

Vue.use(Zutre);

new Vue({
  el: '#app',
  render: h => h(App)
})
