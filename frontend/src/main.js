import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'ant-design-vue/dist/antd.css'

import {
  Button,
  Input,
  Icon,
  Layout,
  Row,
  Col,
  Comment,
  Tooltip,
  Avatar,
  Card,
  Tag,
  Radio,
  Menu,
  Form,
  Alert,
  Empty
} from 'ant-design-vue'

const components = [
  Button,
  Input,
  Icon,
  Layout,
  Row,
  Col,
  Comment,
  Tooltip,
  Avatar,
  Card,
  Tag,
  Radio,
  Menu,
  Form,
  Alert,
  Empty
]

components.forEach(c => Vue.use(c))

Vue.config.productionTip = false

async function main() {
  let storeInstance = await store()

  new Vue({
    router: router(storeInstance),
    store: storeInstance,
    render: h => h(App)
  }).$mount('#app')
}

main()
