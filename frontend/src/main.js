import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'ant-design-vue/dist/antd.css'

import { Button, Input, Icon, Layout, Row, Col, Comment, Tooltip, Avatar, Card, Tag, Radio } from 'ant-design-vue'
const components = [ Button, Input, Icon, Layout, Row, Col, Comment, Tooltip, Avatar, Card, Tag, Radio ]

components.forEach(c => Vue.use(c))

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
