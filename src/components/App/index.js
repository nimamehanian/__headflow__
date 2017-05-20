import { connect } from 'react-redux';
import {
  load as loadAction,
  save as saveAction
} from './actions';
import {
  UPDATE_EDITOR_STATE,
  TOGGLE_EDITOR_FOCUS
} from './actionTypes';
import App from './App';

const mapStateToProps = state => ({
  isEditorFocused: state.app.isEditorFocused,
  isSaving: state.app.isSaving,
  editorState: state.app.editorState,
});

const mapDispatchToProps = dispatch => ({
  load(user) {
    dispatch(loadAction(user));
  },

  save(uid, contentState) {
    dispatch(saveAction(uid, contentState));
  },

  update(editorState) {
    dispatch({ type: UPDATE_EDITOR_STATE, editorState });
  },

  toggleEditorFocus(isEditorFocused) {
    dispatch({ type: TOGGLE_EDITOR_FOCUS, isEditorFocused });
  },
});

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;
