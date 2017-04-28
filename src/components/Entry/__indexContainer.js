import { connect } from 'react-redux';
import Entry from './Entry';

const mapStateToProps = state => ({
  blockList: state.app.editorState
    .getCurrentContent()
    .getBlockMap()
    .toList(),
});

// dispatch available as param
const mapDispatchToProps = () => ({
  noop() {
    console.log('noop');
  },
});

const EntryContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Entry);

export default EntryContainer;
