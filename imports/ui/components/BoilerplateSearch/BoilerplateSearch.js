/* eslint-disable max-len, no-return-assign */

import React from 'react';
// import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { timeago } from '@cleverbeagle/dates';
import { Typeahead } from 'react-bootstrap-typeahead'; // ES2015
import { Meteor } from 'meteor/meteor';
import { Table, Alert, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import PropTypes from 'prop-types';


const handleRemove = (documentId) => {
  if (confirm('Are you sure? This is permanent!')) {
    Meteor.call('boilerplates.remove', documentId, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Document deleted!', 'success');
      }
    });
  }
};
const handleHeart = (documentId, toggle) => {
  Meteor.call('boilerplates.heart', documentId, (error) => {
    if (error) {
      Bert.alert(error.reason, 'danger');
    } else {
      Bert.alert(`Boilerplate ${toggle ? 'unhearted! Sad' : 'loves you back! ❤❤❤'}!`, 'success');
    }
  });
};

class BoilerplateSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: [] };
  }

  render() {
    const { boilerplates, match, history } = this.props;

    // filter dependencies for the typeahead
    // let currentDeps = [...new Set(boilerplates.map(x => x.dependencies).reduce((z, y) => z.concat(y), []))];
    let currentDeps = boilerplates.map(x => x.dependencies).reduce((z, y) => z.concat(y), []);
    let counter = {};
    currentDeps.forEach((word) => {
      counter[word] = (counter[word] || 0) + 1;
    });
    currentDeps.sort((x, y) => counter[y] - counter[x]);
    counter = {};
    currentDeps.forEach((word) => {
      counter[word] = (counter[word] || 0) + 1;
    });
    currentDeps = Object.keys(counter).map(x => `${x} - ${counter[x]}`);

    // only show boilerplates if selected dependencies are a proper subset of a boilerplate's dependencies
    const filteredboilerplates = this.state.selected.length < 1 ? boilerplates :
      boilerplates.filter(x => this.state.selected.every(val => x.dependencies.indexOf(val.split(' - ')[0]) >= 0));
    
    // set up some tooltips
    const tooltipCL = (
      <Tooltip id="tooltip">
        <p>
          <strong>External Load</strong> = <br /> Number of <u>root</u> dependencies <br />
          + (Total number of <u>all</u> dependencies <br />
          + Number of <u>root</u> devDependencies) / 2
        </p>
        <p>
          <i>e.g. ['webpack', 'webpack-dev-middleware', 'webpack-dev-server'...] only counts as 1 root devDependency </i>
        </p>
        <p>
          <strong>Internal Load</strong> = <br /> Number of files and folders <br />
          + Total filesize of Javascript files (eg. .js, .jsx, .vue, .ts)
        </p>
        <p>
          <strong>Cognitive Load</strong> = <br /> Equal weight of Internal and External Load
        </p>
      </Tooltip>
    );
    const tooltipPS = (
      <Tooltip id="tooltipPS">
        <p>
          <strong>Popularity Score</strong> = <br />
          Star count <br />
          + Fork count <br />
          + Subscriber count <br />
          + Contributor count <br />
          - n log(n) <br />
        </p>
        <p>
          <em>where n = number of days since last commit</em>
        </p>
      </Tooltip>
    );
    console.log('filteredboilerplates', filteredboilerplates);
    return (<div>
      <Typeahead
        labelKey="typeahead"
        multiple
        options={currentDeps}
        placeholder="Filter for dependencies..."
        onChange={e => this.setState({ selected: e })}
      />
      {filteredboilerplates.length ? <Table responsive>
        <thead>
          <tr>
            <th />
            <th>Title</th>
            <th>Pop. Score <OverlayTrigger placement="right" overlay={tooltipPS}>
              <i> (?)</i></OverlayTrigger>
            </th>
            <th>Cog. Load <OverlayTrigger placement="right" overlay={tooltipCL}>
              <i> (?)</i></OverlayTrigger>
            </th>
            <th>Score Ratio</th>
            <th>Last Updated</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {filteredboilerplates.map(({ _id, ownerrepo, cogload, intload, extload, popScore, scoreratio, updatedAt, userHearts }) => (
            <tr key={_id}>
              <td>
                <Button
                  bsStyle="info"
                  onClick={() => handleHeart(_id, userHearts && userHearts.includes(Meteor.userId()))}
                  block
                ><span style={userHearts && userHearts.includes(Meteor.userId()) ? { color: 'pink', fontSize: '2em' } : {}}>❤</span></Button>
              </td>
              <td>{ownerrepo} <a href={`https://github.com/${ownerrepo}`} target="_blank">🔗</a></td>
              <td>{popScore}</td>
              <td>{cogload} <br /><small><em>Int:{intload} Ext:{extload}</em></small></td>
              <td>{scoreratio}</td>
              <td>{timeago(updatedAt)}</td>
              <td>
                <Button
                  bsStyle="primary"
                  onClick={() => history.push(`${match.url}/${_id}`)}
                  block
                >Edit</Button>
              </td>
              <td>
                <Button
                  bsStyle="danger"
                  onClick={() => handleRemove(_id)}
                  block
                >X</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table> : <Alert bsStyle="warning">No Boilerplates found!</Alert>}
    </div>);
  }
}

BoilerplateSearch.propTypes = {
  boilerplates: PropTypes.arrayOf(PropTypes.object).isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};


export default BoilerplateSearch;
