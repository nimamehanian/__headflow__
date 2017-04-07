import {
  LOGIN_REQUEST,
  LOGIN_RESOLVE,
  LOGIN_FAILURE
} from './actionTypes';

const initialState = { isAttemptingLogin: false, user: null };

// TODO Handle SIGNUP_* action types
const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, isAttemptingLogin: true, user: null };
    case LOGIN_RESOLVE:
      return { ...state, isAttemptingLogin: false, user: action.user };
    case LOGIN_FAILURE:
      return {
        ...state,
        isAttemptingLogin: false,
        user: null,
        error: action.error,
      };
    default:
      return state;
  }
};

export default authReducer;
