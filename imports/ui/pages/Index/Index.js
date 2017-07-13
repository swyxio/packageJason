// import React from 'react';
// import { Button } from 'react-bootstrap';
// import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert, Form, FormGroup, HelpBlock, FormControl, ControlLabel, Button } from 'react-bootstrap';
// import { Accounts } from 'meteor/accounts-base';
// import { Bert } from 'meteor/themeteorchef:bert';
// import validate from '../../../modules/validate';
import BoilerplateStats from '../../components/BoilerplateStats/BoilerplateStats';

import './Index.scss';

function FieldGroup({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}
        // <span style={{ fontSize: '2em', textAlign: 'center', lineHeight: '90px' }}>  /  </span>

class Index2 extends React.Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    const owner = match.params.owner; // || (this.owner && this.owner.value.trim());
    const repo = match.params.repo; // || (this.repo && this.repo.value.trim());
    const doc = owner && repo ? {} : null;
    // const ownerrepo = (owner && repo ? `${owner}/${repo}` : '') || this.state.ownerrepo;
    const ownerrepo = (owner && repo ? `${owner}/${repo}` : '');
    this.state = { ownerrepo, doc };
    // this.generateOwnerRepo = this.generateOwnerRepo.bind(this);
  }

  // generateOwnerRepo() {
  //   console.log('this', this);
  //   console.log('this.owner', this.owner);
  //   console.log('this.repo', this.repo);
  //   if (!this.owner) return;
  //   if (!this.repo) return;
  //   const ownerrepo = `${this.owner.value.trim()}/${this.repo.value.trim()}`;
  //   this.setState({
  //     ownerrepo,
  //   });
  // }

          // <FieldGroup
          //   id="formControlsText"
          //   type="text"
          //   label="Owner"
          //   placeholder="Enter owner"
          //   defaultValue={owner}
          //   // ref={function abc(x) { console.log('owner x', x); this.repo = x; }}
          //   ref={(x) => { console.log('owner x', x); this.owner = x; }}
          //   style={{ textAlign: 'center' }}
          //   onChange={() => this.generateOwnerRepo()}
          // />
          // <span style={{ fontSize: '2em', display: 'table-cell', verticalAlign: 'bottom' }}>  /  </span>
          // <FieldGroup
          //   id="formControlsText2"
          //   type="text"
          //   label="Repo"
          //   placeholder="Enter repo"
          //   defaultValue={repo}
          //   // ref={function abc(x) { console.log('repo x', x); this.owner = x; }}
          //   ref={(x) => { this.repo = x; }}
          //   style={{ textAlign: 'center' }}
          //   onChange={() => this.generateOwnerRepo()}
          // />
  render() {
    // const { match, history } = this.props;
    // console.log('match', match);
    // console.log('props', this.props);
    // console.log('rendering');
    // https://stackoverflow.com/questions/13586171/css-vertical-align-text-bottom
    return (<div>
      <div className="Index">
        <Form inline style={{ display: 'table', textAlign: 'center', margin: '0 auto' }}>
          <FieldGroup
            id="formControlsText"
            type="text"
            label="Owner"
            placeholder="Enter owner"
            defaultValue={this.state.wnerrepo}
            // ref={function abc(x) { console.log('owner x', x); this.repo = x; }}
            // ref={(x) => { console.log('owner x', x); this.owner = x; }}
            style={{ textAlign: 'center' }}
            onChange={(e) => this.setState({ownerrepo: e.target.value})}
          />
        </Form>
        <h1>PackageJason {this.state.ownerrepo}</h1>
        <p>A boilerplate search engine.</p>
        <div>
          <Button href="http://cleverbeagle.com/pup">Read the Docs</Button>
          <Button href="https://github.com/cleverbeagle/pup"><i className="fa fa-star" /> Star on GitHub</Button>
        </div>
        <footer>
          <p>Need help and want to stay accountable building your product? <a href="http://cleverbeagle.com?utm_source=pupappindex&utm_campaign=oss">Check out Clever Beagle</a>.</p>
        </footer>
      </div>
      <BoilerplateStats
        doc={this.state.doc}
        ownerrepo={this.state.ownerrepo}
        ref={boilerplateStats => (this.boilerplateStats = boilerplateStats)}
      />
    </div>);
  }
}

Index2.propTypes = {
  match: PropTypes.object.isRequired,
  // history: PropTypes.object.isRequired,
};

export default Index2;
