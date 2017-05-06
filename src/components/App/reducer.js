import { Raw, Data } from 'slate';
import {
  APP_LOAD_RESOLVE,
  APP_SAVE_REQUEST,
  APP_SAVE_RESOLVE,
  APP_SAVE_FAILURE,
  UPDATE_EDITOR_STATE
} from './actionTypes';

const initialState = {
  isSaving: false,
  editorState: Raw.deserialize({ nodes: [
    {
      kind: 'block',
      type: 'entry',
      data: Data.create({ isExpanded: true, isVisible: true }),
      nodes: [{ kind: 'text', text: 'Loading...' }],
    },
  ] }, { terse: true, normalize: false }),
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case APP_LOAD_RESOLVE:
      return { ...state, editorState: action.editorState };
    case APP_SAVE_REQUEST:
      return { ...state, isSaving: true };
    case APP_SAVE_RESOLVE:
      return { ...state, isSaving: false };
    case APP_SAVE_FAILURE:
      return { ...state, isSaving: false };
    case UPDATE_EDITOR_STATE:
      return { ...state, editorState: action.editorState };
    default:
      return state;
  }
};

export default appReducer;
