import './router/componentHooks'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import infiniteScroll from 'vue-infinite-scroll'
import { extend } from 'vee-validate'
import {alpha, alpha_num, required} from "vee-validate/dist/rules"; // eslint-disable-line

// Register vee-validate rules
extend("alpha", alpha); // eslint-disable-line
extend("alpha_num", alpha_num); // eslint-disable-line
extend("required", required); // eslint-disable-line

Vue.use(infiniteScroll)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
