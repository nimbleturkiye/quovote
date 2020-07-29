import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import biri from 'biri'
import io from 'socket.io-client'

Vue.use(Vuex)

const mutations = {
  SET_PROPERTY: 'setProperty',
  UPDATE_QUESTIONS: 'updateQuestions',
  SET_COMPUTER_ID: 'setComputerId'
}

const socket = io()

const store = new Vuex.Store({
  state: {
    loading: false,
    eventId: null,
    event: {},
    computerId: 0
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

      await axios.post('/api/register', { computerId })
    },
    async registerUser(store, user) {
      return axios.post('/api/account/register', { user })
    },
    async login(store, user) {
      return axios.post('/api/account/login', user)
    }
  }
})

socket.on('questions updated', questions => {
  store.dispatch('updateQuestions', questions)
})

export default async function init() {
  await store.dispatch('registerComputerId', await biri())
  return store
}
