import {
  EditorState,
  convertFromRaw
} from 'draft-js';
import {
  APP_LOAD_REQUEST,
  APP_LOAD_RESOLVE,
  // APP_LOAD_FAILURE,
  APP_SAVE_REQUEST,
  APP_SAVE_RESOLVE,
  APP_SAVE_FAILURE
} from './actionTypes';
import DB from '../../firebase';

// GET
const loadRequest = () => ({ type: APP_LOAD_REQUEST });
// TODO handle empty DB
const loadResolve = blocks => ({
  type: APP_LOAD_RESOLVE,
  editorState: EditorState.createWithContent(
    convertFromRaw({ blocks, entityMap: {} })
  ),
});
// const loadFailure = () => ({ type: APP_LOAD_FAILURE });

export const load = () => (
  (dispatch) => {
    dispatch(loadRequest());
    DB.ref('/blocks').once('value', (blocks) => {
      dispatch(loadResolve(blocks.val()));
    });
  }
);

// POST
const saveRequest = () => ({ type: APP_SAVE_REQUEST });
const saveResolve = () => ({ type: APP_SAVE_RESOLVE });
const saveFailure = () => ({ type: APP_SAVE_FAILURE });

export const save = contentState => (
  (dispatch) => {
    dispatch(saveRequest());
    DB.ref('/').set(contentState)
      .then(() => dispatch(saveResolve()))
      .catch(() => dispatch(saveFailure()));
  }
);
