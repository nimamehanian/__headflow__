import { Raw } from 'slate';
import {
  APP_LOAD_REQUEST,
  APP_LOAD_RESOLVE,
  // APP_LOAD_FAILURE,
  APP_SAVE_REQUEST,
  APP_SAVE_RESOLVE,
  APP_SAVE_FAILURE
} from './actionTypes';
import { DB } from '../../firebase';

// GET
const loadRequest = () => ({ type: APP_LOAD_REQUEST });
const loadResolve = nodes => ({
  type: APP_LOAD_RESOLVE,
  editorState: nodes,
});
// const loadFailure = () => ({ type: APP_LOAD_FAILURE });
export const load = user => (
  (dispatch) => {
    dispatch(loadRequest());
    DB.ref(`userData/${user.uid}/`).once('value', (nodes) => {
      dispatch(loadResolve(
        Raw.deserialize(nodes.val(), { terse: true, normalize: false })
      ));
    });
  }
);

// POST
const saveRequest = () => ({ type: APP_SAVE_REQUEST });
const saveResolve = () => ({ type: APP_SAVE_RESOLVE });
const saveFailure = () => ({ type: APP_SAVE_FAILURE });
export const save = (uid, contentState) => (
  (dispatch) => {
    dispatch(saveRequest());
    DB.ref(`userData/${uid}`).set(contentState)
      .then(() => dispatch(saveResolve()))
      .catch(() => dispatch(saveFailure()));
  }
);
