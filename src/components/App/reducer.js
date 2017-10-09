import { Raw } from 'slate';
import {
  APP_LOAD_RESOLVE,
  APP_SAVE_REQUEST,
  APP_SAVE_RESOLVE,
  APP_SAVE_FAILURE,
  UPDATE_EDITOR_STATE,
  TOGGLE_EDITOR_FOCUS,
  SIDEBAR_CONTEXT_SELECT
} from './actionTypes';

const initialState = {
  currentContext: 0,
  isEditorFocused: false,
  isSaving: false,
  editorState: Raw.deserialize({
    nodes: [
      {
        kind: 'block',
        type: 'entry',
        data: { isExpanded: true, isVisible: true },
        nodes: [{
          kind: 'text',
          text: 'Loading...',
        }],
      },
    ],
  }, { terse: true }),
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case APP_LOAD_RESOLVE:
      return {
        ...state,
        editorState: action.editorState,
        isDataLoaded: action.isDataLoaded,
      };
    case APP_SAVE_REQUEST:
      return { ...state, isSaving: true };
    case APP_SAVE_RESOLVE:
      return { ...state, isSaving: false };
    case APP_SAVE_FAILURE:
      return { ...state, isSaving: false };
    case UPDATE_EDITOR_STATE:
      return { ...state, editorState: action.editorState };
    case TOGGLE_EDITOR_FOCUS:
      return { ...state, isEditorFocused: action.isEditorFocused };
    case SIDEBAR_CONTEXT_SELECT:
      return { ...state, currentContext: action.currentContext };
    default:
      return state;
  }
};

export default appReducer;
