import React from 'react';
import PropTypes from 'prop-types';
import BoilerplateEditor from '../../components/BoilerplateEditor/BoilerplateEditor';

const NewBoilerplate = ({ history }) => (
  <div className="NewBoilerplate">
    <h4 className="page-header">New Boilerplate</h4>
    <BoilerplateEditor history={history} />
  </div>
);

NewBoilerplate.propTypes = {
  history: PropTypes.object.isRequired,
};

export default NewBoilerplate;
