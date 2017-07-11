import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
// import { Table, Alert, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import { timeago, monthDayYearAtTime } from '@cleverbeagle/dates';
// import { timeago } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
// import { Bert } from 'meteor/themeteorchef:bert';
import BoilerplatesCollection from '../../../api/Boilerplates/Boilerplates';
import Loading from '../../components/Loading/Loading';
import BoilerplateSearch from '../../components/BoilerplateSearch/BoilerplateSearch';

import './Boilerplates.scss';


const Boilerplates = ({ loading, boilerplates, match, history }) => {
  // console.log('match', match);
  // console.log('boilerplates', boilerplates);
  // console.log('history', history);
  // console.log('boilerplates', );
  return !loading ? (
    <div className="Boilerplates">
      <div className="page-header clearfix">
        <h4 className="pull-left">Boilerplates</h4>
        <Link className="btn btn-success pull-right" to={`${match.url}/new`}>Add Boilerplate</Link>
      </div>
      <BoilerplateSearch boilerplates={boilerplates} match={match} history={history} />
    </div>
  ) : <Loading />;
};

Boilerplates.propTypes = {
  loading: PropTypes.bool.isRequired,
  boilerplates: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('boilerplates');
  return {
    loading: !subscription.ready(),
    boilerplates: BoilerplatesCollection.find().fetch(),
  };
}, Boilerplates);
