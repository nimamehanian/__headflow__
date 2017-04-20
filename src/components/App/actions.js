import { EditorState, convertFromRaw } from 'draft-js';
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
const loadResolve = blocks => ({
  type: APP_LOAD_RESOLVE,
  editorState: EditorState.createWithContent(
    convertFromRaw({ blocks, entityMap: {} })
  ),
});
// const loadFailure = () => ({ type: APP_LOAD_FAILURE });
export const load = user => (
  (dispatch) => {
    dispatch(loadRequest());
    console.log('LOADING HERE', 'USER:', user);
    DB.ref(`userData/${user.uid}/blocks`).once('value', (blocks) => {
      dispatch(loadResolve(blocks.val()));
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

// const blocks = b.map(block => (
//   new ContentBlock({
//     characterList: List(),
//     key: block.key,
//     text: block.text,
//     type: block.type,
//     depth: block.depth,
//     data: Map({
//       hasChildren: block.data.hasChildren,
//       isExpanded: block.data.isExpanded,
//       isVisible: block.data.isVisible,
//       note: block.data.note,
//       parentKey: block.data.parentKey,
//     }),
//   })
// ));
