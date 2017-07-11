import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Boilerplates from '../../../api/Boilerplates/Boilerplates';
import BoilerplateEditor from '../../components/BoilerplateEditor/BoilerplateEditor';
import NotFound from '../NotFound/NotFound';

const EditBoilerplate = ({ doc, history }) => (doc ? (
  <div className="EditDocument">
    <h4 className="page-header">{`Editing "${doc.ownerrepo}"`}</h4>
    <BoilerplateEditor doc={doc} history={history} />
  </div>
) : <NotFound />);

EditBoilerplate.propTypes = {
  doc: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(({ match }) => {
  const documentId = match.params._id;
  const subscription = Meteor.subscribe('boilerplates.view', documentId);

  return {
    loading: !subscription.ready(),
    doc: Boilerplates.findOne(documentId),
  };
}, EditBoilerplate);
