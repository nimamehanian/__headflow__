import { Map, List } from 'immutable';
import {
  ContentBlock,
  EditorState,
  convertFromRaw
} from 'draft-js';
import {
  APP_LOAD_RESOLVE,
  APP_SAVE_REQUEST,
  APP_SAVE_RESOLVE,
  APP_SAVE_FAILURE,
  UPDATE_EDITOR_STATE
} from './actionTypes';

const initialState = {
  isSaving: false,
  editorState: EditorState.createWithContent(convertFromRaw({
    blocks: [new ContentBlock({
      characterList: List(),
      key: '',
      text: 'Loading...',
      type: 'unordered-list-item',
      depth: 0,
      data: Map({
        hasChildren: 0,
        isExpanded: true,
        isVisible: true,
        note: '',
        parentKey: '',
      }),
    })],
    entityMap: {},
  })),
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
