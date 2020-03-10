import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const mutations = {
  SET_PROPERTY: 'setProperty'
}

export default new Vuex.Store({
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

      dispatch('fetchQuestions')
    },
    async fetchQuestions ({ commit, state }) {
      const req = await axios.get(`/api/events/${state.eventId}/questions`)
      commit(mutations.SET_PROPERTY, { questions: req.data })
    },
    async setProperty ({ commit }, obj) {
      commit(mutations.SET_PROPERTY, obj)
    }
  }
})
