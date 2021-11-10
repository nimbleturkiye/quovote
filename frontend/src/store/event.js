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
  ARCHIVE_QUESTION: 'archiveQuestion',
  PATCH_QUESTION: 'patchQuestion',
  UPDATE_QUESTIONS: 'updateQuestions',
  CREATE_EVENT: 'createEvent',
  DELETE_EVENT: 'deleteEvent',
  SET_EVENT_ID: 'setEventId',
  GET_RANDOM_EVENT_CODE: 'getRandomEventCode',
  GET_EVENT_CODE_AVAILABILITY: 'getEventCodeAvailability',
  INIT: 'init'
}

const event = {
  namespaced: true,
  state: () => ({
    loading: false,
    eventId: undefined,
    event: undefined
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
      socket.on('questions updated by admin', () => {
        fetchEvent.cancel()
        dispatch(actions.FETCH_EVENT)
      })
    },
    async [actions.FETCH_EVENT_ID_BY_CODE](ctx, code) {
      const res = await axios.get(`/events?code=${code}`)

      return res.data
    },
    async [actions.SUBMIT_QUESTION]({ commit, dispatch, state }, { question, name }) {
      try {
        await axios.post(`/events/${state.eventId}/questions`, { text: question, user: name })
        await dispatch(actions.FETCH_EVENT)
      } catch (e) {
        throw e
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
    async [actions.ARCHIVE_QUESTION]({ dispatch }, { questionId, action }) {
      await dispatch(actions.PATCH_QUESTION, { questionId, action })
    },
    async [actions.WITHDRAW_QUESTION]({ state, dispatch }, questionId) {
      await axios.delete(`/events/${state.eventId}/questions/${questionId}`)
      await dispatch(actions.FETCH_EVENT)
    },
    async [actions.PIN_QUESTION]({ dispatch }, { questionId, action }) {
      await dispatch(actions.PATCH_QUESTION, { questionId, action })
    },
    async [actions.PATCH_QUESTION]({ state, commit, dispatch }, { questionId, action }) {
      commit(mutations.SET_LOADING, true)

      try {
        await axios.patch(`/events/${state.eventId}/questions/${questionId}`, { action })
      } catch (e) {
        throw e
      } finally {
        commit(mutations.SET_LOADING, false)
        await dispatch(actions.FETCH_EVENT)
      }
    },
    [actions.UPDATE_QUESTIONS]({ commit }, questions) {
      commit(mutations.UPDATE_QUESTIONS, questions)
    },
    async [actions.CREATE_EVENT]({ dispatch }, event) {
      await axios.post('/events', event)

      await dispatch('account/fetchUser', {}, { root: true })
    },
    async [actions.DELETE_EVENT]({ dispatch },eventId) {
      await axios.delete(`/events/${eventId}`)
    },
    [actions.SET_EVENT_ID]({ commit }, id) {
      commit(mutations.SET_EVENT_ID, id)
    },
    async [actions.GET_RANDOM_EVENT_CODE]() {
      const res = await axios.get('/event-codes/random')

      return res.data
    },
    async [actions.GET_EVENT_CODE_AVAILABILITY](ctx, code) {
      const res = await axios.get(`/event-codes/availability?code=${code}`)

      return res.data
    }
  }
}

export default event
