/* eslint-disable max-len, no-return-assign */

import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Button, Badge, Panel, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';
// import getPackageJsonFromGithub from 'get-package-json-from-github';

// const packageJson = require('package-json');

class BoilerplateEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = { data: null, tree: null, repo: null, release: null };
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
    if (this.props.doc) {
      this.getDetails();
    }
  }

  getDetails() {
    const owner = this.owner.value.trim();
    const repo = this.repo.value.trim();
    if (!owner || !repo) return;
    axios.defaults.headers.get.Accept = 'application/vnd.github.v3.raw';

    const treecall = axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1&client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`);

    const pkgjsoncall = axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/package.json?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`);

    // https://api.github.com/repos/twbs/bootstrap?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03
    const repocall = axios.get(`https://api.github.com/repos/${owner}/${repo}?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`);
    // // https://api.github.com/repos/twbs/bootstrap/releases?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03
    // releases are ultimately not very helpful as people may not actually release stuff and then the assets may not show up to show download count
    // const releasecall = axios.get(`https://api.github.com/repos/${owner}/${repo}/releases?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`)
    const commitcall = axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`)
    // https://stackoverflow.com/questions/44347339/github-api-how-efficiently-get-the-total-contributors-amount-per-repository
    const contribcall = axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`)

    // Promise.all([repocall, commitcall, contribcall, meteorcall, treecall, pkgjsoncall]).then(([repovar, commitvar, contribvar, meteorvar, treevar, pkgjsonvar]) => {
    Promise.all([repocall, commitcall, contribcall, treecall, pkgjsoncall]).then(async ([repovar, commitvar, contribvar, treevar, pkgjsonvar]) => {
      const pkgjsonvar2 = pkgjsonvar;
      // figure out if we need to do a meteor patch
      await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/.meteor/versions?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`)
      .then((meteorvar) => {
        meteorvar.data.split('\n').forEach((x) => x.length === 0 ? null : pkgjsonvar2.data.dependencies[`[meteor]${x.split('@')[0]}`] = x.split('@')[1]);
      }).catch(() => console.log('not a meteor thing'));

      // console.log('treevar', treevar);
      this.setState({
        // data and tree
        data: pkgjsonvar2.data,
        tree: treevar.data,

        // repovar/contribvar/commitvar

        starcount: repovar.data.stargazers_count,
        forkcount: repovar.data.forks_count,
        subscount: repovar.data.subscribers_count,
        contributorcount: Number(!contribvar.headers.link ? 1 : contribvar.headers.link.split('&page=')[2].split('>;')[0]),
      // Number of dependents
      // Number of downloads
        // downloadcount: releasevar.data.assets[0].download_count,
        lastcommit: commitvar.data[0].commit.author.date,
      // Downloads acceleration
      });
    }).catch((error) => {
      this.setState({
        data: null,
        tree: null,
        starcount: 0,
        forkcount: 0,
        subscount: 0,
        contributorcount: 0,
        lastcommit: '',
      });
      console.log(error);
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingDocument = this.props.doc && this.props.doc._id;
    const methodToCall = existingDocument ? 'boilerplates.update' : 'boilerplates.insert';
    const cl = this.calcCogLoad(this.state.data, this.state.tree);
    const ps = this.calcPopularityScore();
    const doc = {
      ownerrepo: `${this.owner.value.trim()}/${this.repo.value.trim()}`,
      boilerplateReview: this.boilerplateReview.value.trim(),
      // boilerplateKeywords: this.boilerplateKeywords.value.split(',').map(x => x.trim()),
      boilerplateKeywords: this.boilerplateKeywords,
      dependencies: Object.keys(this.state.data.dependencies).concat(this.state.data.devDependencies ? Object.keys(this.state.data.devDependencies) : []),
      cogload: cl,
      intload: this.calcTreeLoad(this.state.tree),
      extload: this.calcDependencyLoad(this.state.data),
      popScore: ps,
      scoreratio: Math.round((ps / cl) * 10) / 10,
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

  calcCogLoad(data, tree) {
    const depLoad = this.calcDependencyLoad(data);
    const treeLoad = this.calcTreeLoad(tree);
    const cogload = (depLoad + treeLoad) / 2;
    return cogload;
  }
  calcDependencyLoad(data) {
    const rawdeps = Object.keys(data.dependencies).length;
    const rootdeps = [...new Set(Object.keys(data.dependencies).map(x => x.split('-')[0]))].length;
    const devdeps = data.devDependencies ? [...new Set(Object.keys(data.devDependencies).map(x => x.split('-')[0]))].length : 0;
    const depload = rootdeps + ((rawdeps + devdeps) / 2);
    return depload;
  }
  calcTreeLoad(tree) {
    const count = tree.tree.length * (tree.truncated ? 1.5 : 1);
    const size = this.calcJSFileSize(tree.tree) * (tree.truncated ? 1.5 : 1);
    const treeload = (count + size) / 2;
    return treeload;
  }
  calcTotalDeps(data) {
    const rawdeps = Object.keys(data.dependencies).length;
    const devdeps = data.devDependencies ? Object.keys(data.devDependencies).length : 0;
    return rawdeps + devdeps;
  }
  calcJSFileSize(data) {
    let size = 0;
    const allowedExtensions = ['js', 'jsx', 'ts', 'vue'];
    data.forEach((x) => {
      if (x.size && x.path.split('.').length > 1 && allowedExtensions.includes(x.path.split('.')[x.path.split('.').length - 1])) {
        size += x.size;
      }
    });
    return Math.round(size / 102.4) / 10;
  }
  calcPopularityScore() {
    const numdays = this.calcNumDaysSinceLastCommit();
    const x = (this.state.starcount + this.state.forkcount + this.state.subscount + this.state.contributorcount) - (numdays * Math.log(numdays));
    return Math.round(x * 10) / 10;
  }
  calcNumDaysSinceLastCommit() {
    console.log('datediff', new Date() - new Date(this.state.lastcommit));
    console.log('mathabs', Math.abs((new Date() - new Date(this.state.lastcommit)) / (1000 * 3600 * 24)));
    const numdays = this.state.lastcommit ? Math.ceil(Math.abs((new Date() - new Date(this.state.lastcommit)) / (1000 * 3600 * 24))) : 1;
    console.log('calcPopularityScore', numdays);
    return numdays;
  }

  displayDependencies() {
    // title or name
    const objTitle = this.state.data.title || this.state.data.name ? <p>Title: {this.state.data.title || this.state.data.name}</p> : null;
    // version
    const objVersion = this.state.data.version ? <p>Version: {this.state.data.version}</p> : null;
    // description
    const objDescription = this.state.data.description ? <p>Description: {this.state.data.description}</p> : null;
    // keywords
    let objKeywords;
    if (this.state.data.keywords) {
      objKeywords = <p>Keywords: {this.state.data.keywords.map(x => <Badge key={x} bsClass="badge badge-primary">{x}</Badge>)}</p>;
    } else {
      objKeywords = null;
    }
    // dependencies
    const z = Object.keys(this.state.data.dependencies).map(y =>
      <li key={y}> {y} <Badge bsClass="badge badge-primary">{this.state.data.dependencies[y]}</Badge></li>,
    );
    const z2 = !this.state.data.devDependencies ? null : Object.keys(this.state.data.devDependencies).map(y =>
      <li key={y}> {y} <Badge bsClass="badge badge-primary">{this.state.data.devDependencies[y]}</Badge></li>,
    );
    // https://stackoverflow.com/questions/24450010/how-to-make-bootstrap-panel-body-with-fixed-height
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
    return (
      <div className="container">
        <b>{this.owner.value} / {this.repo.value}</b> <a href={`https://github.com/${this.owner.value}/${this.repo.value}`} target="_blank">🔗</a> {objTitle}
        <p>
          <b>Popularity Score: </b>
            Stars (<span style={{ color: 'green' }}>{this.state.starcount}</span>) +
            Fork (<span style={{ color: 'green' }}>{this.state.forkcount}</span>) +
            Subscribers (<span style={{ color: 'green' }}>{this.state.subscount}</span>) +
            Contributors (<span style={{ color: 'green' }}>{this.state.contributorcount}</span>) -
            Commit Age Penalty  (f(<span style={{ color: 'red' }}>{this.calcNumDaysSinceLastCommit()}</span>)):
          <span style={{ color: 'green' }}> <b>{this.calcPopularityScore()}</b></span>
          <OverlayTrigger placement="right" overlay={tooltipPS}>
            <i> (<u>what is this?</u>)</i>
          </OverlayTrigger>
        </p>
        <p>
          <b>Boilerplate Load: </b>
          50% External (<span style={{ color: 'red' }}>{this.state.data ? this.calcDependencyLoad(this.state.data) : ''}</span>) +
           50% Internal (<span style={{ color: 'red' }}>{this.state.tree ? this.calcTreeLoad(this.state.tree) : ''}</span>) =
          Cognitive Load Score: <span style={{ color: 'red' }}><b>{this.state.tree && this.state.data ? this.calcCogLoad(this.state.data, this.state.tree) : ''}</b></span>
          <OverlayTrigger placement="right" overlay={tooltipCL}>
            <i> (<u>what is this?</u>)</i>
          </OverlayTrigger>
        </p>
        <p>
          <b>Key Raw Numbers: </b>
          <a href={`https://api.github.com/repos/${this.owner.value}/${this.repo.value}/contents/package.json`} target="_blank">Total Dependencies</a>:
            <span style={{ color: 'red' }}> {this.calcTotalDeps(this.state.data)}</span> /
          <a href={`https://api.github.com/repos/${this.owner.value}/${this.repo.value}/git/trees/master?recursive=1`} target="_blank"> Folder+Filecount</a>:
            <span style={{ color: 'red' }}> {this.state.tree && this.state.tree.tree.length}{this.state.tree && this.state.tree.truncated ? '+' : ''}</span> /
          JS Filesize: <span style={{ color: 'red' }}>{this.state.tree && this.calcJSFileSize(this.state.tree.tree)}{this.state.tree && this.state.tree.truncated ? '+' : ''}</span>kb
        </p>
        <Panel header="Repo metadata" style={{ height: 200, overflowY: 'scroll' }}>
          {objVersion}
          {objDescription}
          {objKeywords}
          Dependencies:
          <ul>
            {z}
          </ul>
          <b>Dev Dependencies:</b>
          <ul>
            {z2}
          </ul>
        </Panel>
      </div>
    );
  }
  render() {
    const { doc } = this.props;
    return (<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
      <FormGroup>
        <ControlLabel>Owner</ControlLabel>
        <input
          type="text"
          className="form-control"
          name="owner"
          ref={owner => (this.owner = owner)}
          defaultValue={doc && doc.ownerrepo && doc.ownerrepo.split('/')[0]}
          placeholder="e.g. facebook"
          onChange={e => this.getDetails(e)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Repo</ControlLabel>
        <input
          type="text"
          className="form-control"
          name="repo"
          ref={repo => (this.repo = repo)}
          defaultValue={doc && doc.ownerrepo && doc.ownerrepo.split('/')[1]}
          placeholder="e.g. react"
          onChange={e => this.getDetails(e)}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Boilerplate Keywords</ControlLabel> (Don't talk about the dependencies. e.g.: fullstack, microservices, mobile-friendly, PWA, CRUD)
        <input
          type="text"
          className="form-control"
          name="boilerplateKeywords"
          ref={boilerplateKeywords => (this.boilerplateKeywords = boilerplateKeywords && boilerplateKeywords.value.split(',').map(x => x.trim()))}
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
      { this.state.data ? this.displayDependencies() : <FormGroup> {`${this.owner ? this.owner.value : 'blank'}/${this.repo ? this.repo.value : 'blank'}`} is invalid. Please input a valid owner/repo combo. </FormGroup>}
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
