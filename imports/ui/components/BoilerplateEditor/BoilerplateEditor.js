/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';
import BoilerplateStats from '../BoilerplateStats/BoilerplateStats';

function trimgithub(x) {
  const short = (x.substring(0, 19) === 'https://github.com/') ? x.replace('https://github.com/', '') : x;
  const short2 = short.split('/');
  return short2.length > 1 ? `${short2[0]}/${short2[1]}` : short;
}

class BoilerplateEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = { ownerrepo: (this.props.doc && this.props.doc.ownerrepo) || '' };
  }

  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        owner: {
          required: true,
        },
        repo: {
          required: true,
        },
        boilerplateReview: {
          required: true,
        },
        boilerplateKeys: {
          required: true,
        },
      },
      messages: {
        owner: {
          required: 'Need an owner.',
        },
        repo: {
          required: 'Need a repo.',
        },
        boilerplateReview: {
          required: 'Need a review.',
        },
        boilerplateKeys: {
          required: 'Need keys.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
    // if (this.props.doc) {
    //   this.getDetails();
    // }
  }

  generateOwnerRepo() {
    if (!this.ownerrepo) return;
    const ownerrepo = trimgithub(this.ownerrepo.value.trim());
    this.setState({
      ownerrepo: `${ownerrepo}`,
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingDocument = this.props.doc && this.props.doc._id;
    const methodToCall = existingDocument ? 'boilerplates.update' : 'boilerplates.insert';
    // console.log('this.boilerplateStats', this.boilerplateStats);
    // console.log('this.boilerplateKeywords', this.boilerplateKeywords.value);
    const doc = {
      ownerrepo: `${trimgithub(this.ownerrepo.value.trim())}`,
      boilerplateReview: this.boilerplateReview.value.trim(),
      boilerplateKeywords: this.boilerplateKeywords.value.split(',').map(x => x.trim()),
      // boilerplateKeywords: this.boilerplateKeywords,
      dependencies: this.boilerplateStats.state.dependencies,
      cogload: this.boilerplateStats.state.cogload,
      intload: this.boilerplateStats.state.treeload,
      extload: this.boilerplateStats.state.depload,
      popScore: this.boilerplateStats.state.popScore,
      scoreratio: Math.round((this.boilerplateStats.state.popScore / this.boilerplateStats.state.cogload) * 10) / 10,
    };

    if (existingDocument) doc._id = existingDocument;

    Meteor.call(methodToCall, doc, (error, documentId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingDocument ? 'Boilerplate updated!' : 'Boilerplate added!';
        this.form.reset();
        Bert.alert(`${confirmation} ID: ${documentId}`, 'success');
        history.push('/boilerplates');
      }
    });
  }

  render() {
    const { doc } = this.props;
    return (<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
      <FormGroup>
        <ControlLabel>Owner/Repo</ControlLabel>
        <input
          type="text"
          className="form-control"
          name="ownerrepo"
          ref={ownerrepo => (this.ownerrepo = ownerrepo)}
          defaultValue={doc && doc.ownerrepo}
          placeholder='e.g. "facebook/react" or http://github.com/facebook/react'
          onChange={e => this.generateOwnerRepo(e)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Boilerplate Keywords</ControlLabel> (Don't talk about the dependencies. e.g.: fullstack, microservices, mobile-friendly, PWA, CRUD)
        <input
          type="text"
          className="form-control"
          name="boilerplateKeywords"
          ref={boilerplateKeywords => (this.boilerplateKeywords = boilerplateKeywords)}
          defaultValue={doc && doc.boilerplateKeywords && doc.boilerplateKeywords.join(', ')}
          placeholder="Talk about use cases, architecture, etc. Input is comma separated e.g. fullstack, microservices"
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Review</ControlLabel>
        <textarea
          className="form-control"
          name="boilerplateReview"
          ref={boilerplateReview => (this.boilerplateReview = boilerplateReview)}
          defaultValue={doc && doc.boilerplateReview}
          placeholder="Your review of the boilerplate"
        />
      </FormGroup>
      <BoilerplateStats
        doc={doc}
        ownerrepo={`${this.state.ownerrepo}` || (doc && doc.ownerrepo)}
        ref={boilerplateStats => (this.boilerplateStats = boilerplateStats)}
      />
      <Button type="submit" bsStyle="success">
        {doc && doc._id ? 'Save Changes' : 'Add Boilerplate'}
      </Button>
    </form>);
  }
}

BoilerplateEditor.defaultProps = {
  doc: { title: '', url: '' },
};

BoilerplateEditor.propTypes = {
  doc: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default BoilerplateEditor;
