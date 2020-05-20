import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import io from 'socket.io-client'

Vue.use(Vuex)

const mutations = {
  SET_PROPERTY: 'setProperty',
  UPDATE_QUESTIONS: 'updateQuestions'
}

const socket = io()

const store = new Vuex.Store({
  state: {
    loading: false,
    eventId: null,
    event: {}
  },
  mutations: {
    [mutations.SET_PROPERTY] (state, obj) {
      for (var key in obj) {
        state[key] = obj[key]
      }
    },
    [mutations.UPDATE_QUESTIONS] (state, obj) {
      state.event.questions = obj
    }
  },
  actions: {
    async fetchEventIdByCode (ctx, code) {
      const res = await axios.get(`/api/events?code=${code}`)
      return res.data
    },
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
    async fetchEvent ({ commit, state }) {
      const req = await axios.get(`/api/events/${state.eventId}`)

      commit(mutations.SET_PROPERTY, { event: req.data })
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
    async joinEvent ({ commit, dispatch, state }) {
      socket.emit('join-room', state.eventId)
      dispatch('fetchEvent')
    },
    async withdrawQuestion ({ state }, questionId) {
      await axios.delete(`/api/events/${state.eventId}/questions/${questionId}`)
    },
    updateQuestions ({ commit }, questions) {
      commit(mutations.UPDATE_QUESTIONS, questions)
    }
  }
})

socket.on('questions updated', questions => {
  store.dispatch('updateQuestions', questions)
})

export default store
