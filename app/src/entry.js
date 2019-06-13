import Vue from 'vue';
import VueRouter from 'vue-router';

import BootstrapVue from 'bootstrap-vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'video.js/dist/video-js.css';
import './assets/fontawesome.min.css';
import './assets/custom.css';

import App from './App.vue';
import Home from './components/home.vue';
import StreamWindow from './components/stream-window.vue';

window.$ = require('jquery');
window.JQuery = require('jquery');

library.add(faSearch);

Vue.use(VueRouter);
Vue.use(BootstrapVue);

Vue.component('font-awesome-icon', FontAwesomeIcon);

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
});

new Vue({
	el: '#app',
	router,
	render: h => h(App)
});
