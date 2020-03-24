import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'ant-design-vue/dist/antd.css'

import { Button, Input, Icon } from 'ant-design-vue'
Vue.use(Button)
Vue.use(Input)
Vue.use(Icon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
