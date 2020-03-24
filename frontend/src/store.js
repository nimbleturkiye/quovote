import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import io from 'socket.io-client'

Vue.use(Vuex)

const mutations = {
  SET_PROPERTY: 'setProperty'
}

const socket = io()

const store = new Vuex.Store({
  state: {
    questions: [],
    loading: false,
    eventId: null
  },
  mutations: {
    [mutations.SET_PROPERTY] (state, obj) {
      for (var key in obj) {
        state[key] = obj[key]
      }
    }
  },
  actions: {
    async submitQuestion ({ commit, dispatch, state }, { question, name }) {
      commit(mutations.SET_PROPERTY, { loading: true })

      try {
        await axios.post(`/api/events/${state.eventId}/questions`, { text: question, user: name })
      } catch (e) {
        throw e
      } finally {
        commit(mutations.SET_PROPERTY, { loading: false })
      }
    },
    async fetchQuestions ({ commit, state }) {
      const req = await axios.get(`/api/events/${state.eventId}/questions`)

      commit(mutations.SET_PROPERTY, { questions: req.data })
    },
    async vote ({ commit, state }, { questionId, vote }) {
      commit(mutations.SET_PROPERTY, { loading: true })

      try {
        await axios.patch(`/api/events/${state.eventId}/questions/${questionId}`, { vote })
      } catch (e) {
        throw e
      } finally {
        commit(mutations.SET_PROPERTY, { loading: false })
      }
    },
    async setProperty ({ commit }, obj) {
      commit(mutations.SET_PROPERTY, obj)
    },
    async joinEvent ({ commit, state }) {
      socket.emit('join-room', state.eventId)
    }
  }
})

socket.on('questions updated', questions => {
  store.dispatch('setProperty', { questions })
})

export default store
