import { connect } from 'react-redux';
import {
  load as loadAction,
  save as saveAction
} from './actions';
import {
  UPDATE_EDITOR_STATE
} from './actionTypes';
import App from './App';

const mapStateToProps = state => ({
  isSaving: state.app.isSaving,
  editorState: state.app.editorState,
});

const mapDispatchToProps = dispatch => ({
  load(user) {
    dispatch(loadAction(user));
  },

  save(contentState) {
    dispatch(saveAction(contentState));
  },

  update(editorState) {
    dispatch({ type: UPDATE_EDITOR_STATE, editorState });
  },
});

const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

export default AppContainer;
