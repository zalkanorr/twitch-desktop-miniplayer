import Vue from 'vue';
import VueRouter from 'vue-router';

import Zutre from 'zutre';

import "zutre/dist/zutre.css";
import "video.js/dist/video-js.css";

import App from './App.vue';
import Home from './components/home.vue';
import StreamWindow from './components/stream-window.vue';

window.$ = require('jquery')
window.JQuery = require('jquery')

Vue.use(VueRouter);
Vue.use(Zutre);

const router = new VueRouter({
  routes: [
    { 
      path: '/',
      component: Home
    },
    { 
      path: '/home',
      component: Home
    },
    {
      path: '/stream-window',
      component: StreamWindow
    }
  ]
})

new Vue({
  el: '#app',
  router,
  render: h => h(App)
});