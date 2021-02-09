import axios from 'axios'
import io from 'socket.io-client'
import throttle from 'lodash.throttle'

const socket = io(process.env.VUE_APP_SOCKET_PATH)

const mutations = {
  UPDATE_QUESTIONS: 'updateQuestions',
  SET_EVENT: 'setEvent',
  SET_EVENT_ID: 'setEventId',
  SET_LOADING: 'setLoading'
}

const actions = {
  FETCH_EVENT_ID_BY_CODE: 'fetchEventIdByCode',
  SUBMIT_QUESTION: 'submitQuestion',
  FETCH_EVENT: 'fetchEvent',
  VOTE: 'vote',
  JOIN_EVENT: 'joinEvent',
  WITHDRAW_QUESTION: 'withdrawQuestion',
  PIN_QUESTION: 'pinQuestion',
  PATCH_QUESTION: 'patchQuestion',
  UPDATE_QUESTIONS: 'updateQuestions',
  CREATE_EVENT: 'createEvent',
  SET_EVENT_ID: 'setEventId',
  INIT: 'init'
}

const event = {
  namespaced: true,
  state: () => ({
    loading: false,
    eventId: null,
    event: {}
  }),
  mutations: {
    [mutations.SET_LOADING](state, val) {
      state.loading = val
    },
    [mutations.UPDATE_QUESTIONS](state, obj) {
      state.event.questions = obj
    },
    [mutations.SET_EVENT](state, obj) {
      state.event = obj
    },
    [mutations.SET_EVENT_ID](state, id) {
      state.eventId = id
    }
  },
  actions: {
    async [actions.INIT]({ dispatch }) {
      const fetchEvent = throttle(() => dispatch(actions.FETCH_EVENT), 30000)

      socket.on('questions updated', fetchEvent)
    },
    async [actions.FETCH_EVENT_ID_BY_CODE](ctx, code) {
      const res = await axios.get(`/events?code=${code}`)

      return res.data
    },
    async [actions.SUBMIT_QUESTION]({ commit, dispatch, state }, { question, name }) {
      commit(mutations.SET_LOADING, true)

      try {
        await axios.post(`/events/${state.eventId}/questions`, { text: question, user: name })
      } catch (e) {
        throw e
      } finally {
        commit(mutations.SET_LOADING, false)
      }
    },
    async [actions.FETCH_EVENT]({ commit, state }) {
      const req = await axios.get(`/events/${state.eventId}`)

      commit(mutations.SET_EVENT, req.data)
    },
    async [actions.VOTE]({ dispatch }, { questionId, action }) {
      await dispatch(actions.PATCH_QUESTION, { questionId, action })
    },
    async [actions.JOIN_EVENT]({ commit, dispatch, state }) {
      console.log('join event')
      socket.emit('join-room', state.eventId)
      await dispatch(actions.FETCH_EVENT)
    },
    async [actions.WITHDRAW_QUESTION]({ state }, questionId) {
      await axios.delete(`/events/${state.eventId}/questions/${questionId}`)
    },
    async [actions.PIN_QUESTION]({ dispatch }, { questionId, action }) {
      await dispatch(actions.PATCH_QUESTION, { questionId, action })
    },
    async [actions.PATCH_QUESTION]({ state, commit }, { questionId, action }) {
      commit(mutations.SET_LOADING, true)

      try {
        await axios.patch(`/events/${state.eventId}/questions/${questionId}`, { action })
      } catch (e) {
        throw e
      } finally {
        commit(mutations.SET_LOADING, false)
      }
    },
    [actions.UPDATE_QUESTIONS]({ commit }, questions) {
      commit(mutations.UPDATE_QUESTIONS, questions)
    },
    async [actions.CREATE_EVENT]({ dispatch }, event) {
      await axios.post('/events', event)

      await dispatch('account/fetchSession', {}, { root: true })
    },
    [actions.SET_EVENT_ID]({ commit }, id) {
      commit(mutations.SET_EVENT_ID, id)
    }
  }
}

export default event
