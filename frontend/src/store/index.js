import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

import account from './account'
import event from './event'

Vue.use(Vuex)

axios.defaults.baseURL = process.env.VUE_APP_BASE_PATH
axios.defaults.withCredentials = true

const store = new Vuex.Store({
  modules: {
    account,
    event
  }
})

export default async function init() {
  await store.dispatch('account/init')
  await store.dispatch('event/init')

  return store
}
