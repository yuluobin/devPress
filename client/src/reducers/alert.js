import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_ALERT:
      return [...state, action.payload]; //  return alert with payload
    case REMOVE_ALERT:
      return state.filter(alert => alert.id !== payload); //  remove alert except the one matches the payload
    default:
      return state;
  }
}
