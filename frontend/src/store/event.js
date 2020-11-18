const mutations = {
  UPDATE_QUESTIONS: 'updateQuestions',
  SET_EVENT: 'setEvent',
  SET_EVENT_ID: 'setEventId',
}

const actions = {
  FETCH_EVENT_ID_BY_CODE: 'fetchEventIdByCode',
  SUBMIT_QUESTION: 'submitQuestion',
  FETCH_EVENT: 'fetchEvent',
  VOTE: 'vote',
  JOIN_EVENT: 'joinEvent',
  WITHDRAW_QUESTION: 'withdrawQuestion',
  UPDATE_QUESTIONS: 'updateQuestions',
  CREATE_EVENT: 'createEvent',
  SET_EVENT_ID: 'setEventId',
}

const event = {
  state: {
    eventId: null,
    event: {},
  },
  mutations: {
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
    async [actions.VOTE]({ commit, state }, { questionId, vote }) {
      commit(mutations.SET_LOADING, true)
  
      try {
        await axios.patch(`/events/${state.eventId}/questions/${questionId}`, { vote })
      } catch (e) {
        throw e
      } finally {
        commit(mutations.SET_LOADING, false)
      }
    },
    async [actions.JOIN_EVENT]({ commit, dispatch, state }) {
      console.log('join event')
      socket.emit('join-room', state.eventId)
      dispatch('fetchEvent')
    },
    async [actions.WITHDRAW_QUESTION]({ state }, questionId) {
      await axios.delete(`/events/${state.eventId}/questions/${questionId}`)
    },
    [actions.UPDATE_QUESTIONS]({ commit }, questions) {
      commit(mutations.UPDATE_QUESTIONS, questions)
    },
    async [actions.CREATE_EVENT]({ dispatch }, event) {
      await axios.post('/events', event)
      await dispatch('fetchSession')
    }
  }
}

export default event
