import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import biri from 'biri'
import io from 'socket.io-client'

import user from './user'
import event from './event'

Vue.use(Vuex)

axios.defaults.baseURL = process.env.VUE_APP_BASE_PATH
axios.defaults.withCredentials = true

const mutations = {
  SET_LOADING: 'setLoading',
}

const socket = io(process.env.VUE_APP_SOCKET_PATH)

const store = new Vuex.Store({
  state: {
    loading: false,
  },
  mutations: {
    [mutations.SET_LOADING](state, val) {
      state.loading = val
    },
  },
  modules: {
    user,
    event
  }
})

socket.on('questions updated', () => {
  store.dispatch('fetchEvent')
})

export default async function init() {
  let computerId

  try {
    computerId = await biri()
  } catch (e) {
    console.log('Cannot activate biri.')
  }

  await store.dispatch('registerComputerId', computerId)
  await store.dispatch('fetchSession')
  return store
}
