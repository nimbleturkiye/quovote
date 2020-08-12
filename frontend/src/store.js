import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import biri from 'biri'
import io from 'socket.io-client'

Vue.use(Vuex)

const mutations = {
  SET_PROPERTY: 'setProperty',
  UPDATE_QUESTIONS: 'updateQuestions',
  SET_COMPUTER_ID: 'setComputerId',
  SET_USER: 'setUser'
}

const socket = io()

const store = new Vuex.Store({
  state: {
    loading: false,
    eventId: null,
    event: {},
    computerId: 0,
    user: null
  },
  mutations: {
    [mutations.SET_PROPERTY](state, obj) {
      for (var key in obj) {
        state[key] = obj[key]
      }
    },
    [mutations.UPDATE_QUESTIONS](state, obj) {
      state.event.questions = obj
    },
    [mutations.SET_COMPUTER_ID](state, computerId) {
      state.computerId = computerId
    },
    [mutations.SET_USER](state, user) {
      state.user = user
    }
  },
  actions: {
    async fetchEventIdByCode(ctx, code) {
      const res = await axios.get(`/api/events?code=${code}`)
      return res.data
    },
    async submitQuestion({ commit, dispatch, state }, { question, name }) {
      commit(mutations.SET_PROPERTY, { loading: true })

      try {
        await axios.post(`/api/events/${state.eventId}/questions`, { text: question, user: name })
      } catch (e) {
        throw e
      } finally {
        commit(mutations.SET_PROPERTY, { loading: false })
      }
    },
    async fetchEvent({ commit, state }) {
      const req = await axios.get(`/api/events/${state.eventId}`)

      commit(mutations.SET_PROPERTY, { event: req.data })
    },
    async vote({ commit, state }, { questionId, vote }) {
      commit(mutations.SET_PROPERTY, { loading: true })

      try {
        await axios.patch(`/api/events/${state.eventId}/questions/${questionId}`, { vote })
      } catch (e) {
        throw e
      } finally {
        commit(mutations.SET_PROPERTY, { loading: false })
      }
    },
    async setProperty({ commit }, obj) {
      commit(mutations.SET_PROPERTY, obj)
    },
    async joinEvent({ commit, dispatch, state }) {
      console.log('join event')
      socket.emit('join-room', state.eventId)
      dispatch('fetchEvent')
    },
    async withdrawQuestion({ state }, questionId) {
      await axios.delete(`/api/events/${state.eventId}/questions/${questionId}`)
    },
    updateQuestions({ commit }, questions) {
      commit(mutations.UPDATE_QUESTIONS, questions)
    },
    async registerComputerId({ commit }, computerId) {
      commit(mutations.SET_COMPUTER_ID, computerId)

      await axios.post('/api/singularity', { computerId })
    },
    async registerUser(store, user) {
      return axios.post('/api/account/register', { user })
    },
    async login({ commit }, credentials) {
      try {
        const user = await axios.post('/api/account/session', credentials)
        commit(mutations.SET_USER, user)
      } catch (e) {
        throw e
      }
    },
    async logout({ commit }) {
      await axios.delete('/api/account/session')
      commit(mutations.SET_USER, null)
    },
    async fetchSession({ commit }) {
      const user = await axios.get('/api/account/session')
      commit(mutations.SET_USER, user.data)
    }
  }
})

socket.on('questions updated', questions => {
  store.dispatch('updateQuestions', questions)
})

export default async function init() {
  await store.dispatch('registerComputerId', await biri())
  await store.dispatch('fetchSession')
  return store
}
