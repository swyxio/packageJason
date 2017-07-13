/* eslint-disable max-len, no-return-assign */

import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Panel, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import { Meteor } from 'meteor/meteor';
// import { Bert } from 'meteor/themeteorchef:bert';

class BoilerplateStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, tree: null, repo: null, failed_ownerrepo: [], currentrepo: ''};
  }
  componentDidMount() {
    if (this.props.doc) {
      this.getDetails();
    }
  }

  getDetails() {
    const ownerrepo = this.props.ownerrepo;
    console.log('this.state.failed_ownerrepo', this.state.failed_ownerrepo);
    console.log('this.state.failed_ownerrepo ownerrepo', ownerrepo);
    if (!ownerrepo || this.state.failed_ownerrepo.includes(ownerrepo)) return;
    axios.defaults.headers.get.Accept = 'application/vnd.github.v3.raw';
    console.log('Hi! thanks for checking me out. I am a newbie developer and put my client/id here because I wanted to ship this thing quickly. No hack us plz! \n \n @swyx')
    const treecall = axios.get(`https://api.github.com/repos/${ownerrepo}/git/trees/master?recursive=1&client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`);
    const pkgjsoncall = axios.get(`https://api.github.com/repos/${ownerrepo}/contents/package.json?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`);
    const repocall = axios.get(`https://api.github.com/repos/${ownerrepo}?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`);
    const commitcall = axios.get(`https://api.github.com/repos/${ownerrepo}/commits?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`);
    const contribcall = axios.get(`https://api.github.com/repos/${ownerrepo}/contributors?per_page=1&client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`);

    Promise.all([repocall, commitcall, contribcall, treecall, pkgjsoncall]).then(async ([repovar, commitvar, contribvar, treevar, pkgjsonvar]) => {
      const pkgjsonvar2 = pkgjsonvar;
      // figure out if we need to do a meteor patch
      await axios.get(`https://api.github.com/repos/${ownerrepo}/contents/.meteor/versions?client_id=6d9110c2756af4885f35&client_secret=f6c615cb93489d50141b33df68e581b24029db03`)
      .then((meteorvar) => {
        meteorvar.data.split('\n').forEach(x => (x.length === 0 ? null : pkgjsonvar2.data.dependencies[`[meteor]${x.split('@')[0]}`] = x.split('@')[1]));
      }).catch(() => console.log('not a meteor based boilerplate'));
      const starcount = repovar.data.stargazers_count;
      const forkcount = repovar.data.forks_count;
      const subscount = repovar.data.subscribers_count;
      const contributorcount = Number(!contribvar.headers.link ? 1 : contribvar.headers.link.split('&page=')[2].split('>;')[0]);
      const lastcommit = commitvar.data[0].commit.author.date;
      this.setState({
        currentrepo: ownerrepo,
        data: pkgjsonvar2.data,
        tree: treevar.data,
        starcount,
        forkcount,
        subscount,
        contributorcount,
      // Number of dependents - can not find
      // Number of downloads - can not find
        // downloadcount: releasevar.data.assets[0].download_count,
        lastcommit,
      // Downloads acceleration - can not find

      // now lets calculate the metrics
        cogload: this.calcCogLoad(pkgjsonvar2.data, treevar.data),
        depload: this.calcDependencyLoad(pkgjsonvar2.data),
        treeload: this.calcTreeLoad(treevar.data),
        popScore: this.calcPopularityScore(lastcommit, starcount, forkcount, subscount, contributorcount),
        dependencies: Object.keys(pkgjsonvar2.data.dependencies).concat(pkgjsonvar2.data.devDependencies ? Object.keys(pkgjsonvar2.data.devDependencies) : [])
      });
    }).catch((error) => {
      const newfailrepo = this.state.failed_ownerrepo.includes(ownerrepo) ? this.state.failed_ownerrepo : this.state.failed_ownerrepo.concat(ownerrepo);
      console.log('newfailrepo', newfailrepo);
      this.setState({
        data: null,
        tree: null,
        starcount: 0,
        forkcount: 0,
        subscount: 0,
        contributorcount: 0,
        lastcommit: '',
        failed_ownerrepo: newfailrepo,
      });
      console.log(error);
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
  calcPopularityScore(lastcommit, starcount, forkcount, subscount, contributorcount) {
    const numdays = this.calcNumDaysSinceLastCommit(lastcommit);
    // console.log('numdays', numdays);
    // console.log('starcount', starcount);
    // console.log('forkcount', forkcount);
    // console.log('subscount', subscount);
    // console.log('contributorcount', contributorcount);
    const x = (starcount + forkcount + subscount + contributorcount) - (numdays * Math.log(numdays));
    // console.log('x', x);
    const popScore = Math.round(x * 10) / 10;
    // console.log('popScore', popScore);
    return popScore;
  }
  calcNumDaysSinceLastCommit(lastcommit) {
    // console.log('datediff', new Date() - new Date(this.state.lastcommit));
    // console.log('mathabs', Math.abs((new Date() - new Date(this.state.lastcommit)) / (1000 * 3600 * 24)));
    const numdays = lastcommit ? Math.ceil(Math.abs((new Date() - new Date(lastcommit)) / (1000 * 3600 * 24))) : 1;
    // console.log('calcPopularityScore', numdays);
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

    // https://stackoverflow.com/questions/24450010/how-to-make-bootstrap-panel-body-with-fixed-height
    const tooltipCognitiveLoad = (
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
    const tooltipPopularityScore = (
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
        <b>{this.props.ownerrepo}</b> <a href={`https://github.com/${this.props.ownerrepo}`} target="_blank">🔗</a> {objTitle}
        <p>
          <b>Popularity Score: </b>
            Stars (<span style={{ color: 'green' }}>{this.state.starcount}</span>) +
            Fork (<span style={{ color: 'green' }}>{this.state.forkcount}</span>) +
            Subscribers (<span style={{ color: 'green' }}>{this.state.subscount}</span>) +
            Contributors (<span style={{ color: 'green' }}>{this.state.contributorcount}</span>) -
            Commit Age Penalty  (f(<span style={{ color: 'red' }}>{this.calcNumDaysSinceLastCommit(this.state.lastcommit)}</span>)):
          <span style={{ color: 'green' }}> <b>{this.calcPopularityScore(this.state.lastcommit, this.state.starcount, this.state.forkcount, this.state.subscount, this.state.contributorcount)}</b></span>
          <OverlayTrigger placement="right" overlay={tooltipPopularityScore}>
            <i> (<u>what is this?</u>)</i>
          </OverlayTrigger>
        </p>
        <p>
          <b>Boilerplate Load: </b>
          50% External (<span style={{ color: 'red' }}>{this.state.data ? this.calcDependencyLoad(this.state.data) : ''}</span>) +
           50% Internal (<span style={{ color: 'red' }}>{this.state.tree ? this.calcTreeLoad(this.state.tree) : ''}</span>) =
          Cognitive Load Score: <span style={{ color: 'red' }}><b>{this.state.tree && this.state.data ? this.calcCogLoad(this.state.data, this.state.tree) : ''}</b></span>
          <OverlayTrigger placement="right" overlay={tooltipCognitiveLoad}>
            <i> (<u>what is this?</u>)</i>
          </OverlayTrigger>
        </p>
        <p>
          <b>Key Raw Numbers: </b>
          <a href={`https://api.github.com/repos/${this.props.ownerrepo}/contents/package.json`} target="_blank">Total Dependencies</a>:
            <span style={{ color: 'red' }}> {this.calcTotalDeps(this.state.data)}</span> /
          <a href={`https://api.github.com/repos/${this.props.ownerrepo}/git/trees/master?recursive=1`} target="_blank"> Folder+Filecount</a>:
            <span style={{ color: 'red' }}> {this.state.tree && this.state.tree.tree.length}{this.state.tree && this.state.tree.truncated ? '+' : ''}</span> /
          JS Filesize: <span style={{ color: 'red' }}>{this.state.tree && this.calcJSFileSize(this.state.tree.tree)}{this.state.tree && this.state.tree.truncated ? '+' : ''}</span>kb
        </p>
        <Panel header="Repo metadata" style={{ height: 200, overflowY: 'scroll' }}>
          {objVersion}
          {objDescription}
          {objKeywords}
          <b>Dependencies:</b>
          <ul>
            {Object.keys(this.state.data.dependencies).map(y =>
              <li key={y}> {y} <Badge bsClass="badge badge-primary">{this.state.data.dependencies[y]}</Badge></li>,
            )}
          </ul>
          <b>Dev Dependencies:</b>
          <ul>
            {!this.state.data.devDependencies ? null : Object.keys(this.state.data.devDependencies).map(y =>
              <li key={y}> {y} <Badge bsClass="badge badge-primary">{this.state.data.devDependencies[y]}</Badge></li>,
            )}
          </ul>
        </Panel>
      </div>
    );
  }
  render() {
    // const { doc } = this.props;
    const ownerrepo = this.props.ownerrepo;
    if (this.state.currentrepo !== ownerrepo) {
      this.setState({
        currentrepo: ownerrepo,
        data: null,
      });
    }
    console.log('boilerplatestats ownerrepo', ownerrepo);
    console.log('this.state.data', this.state.data);
    if (!this.state.data && ownerrepo.indexOf('/') + 1) this.getDetails();
    // if (!this.state.data && ownerrepo.indexOf('/') + 1 && ownerrepo.split('/')[1].length > 0) this.getDetails();
    return (<div>
      { this.state.data ?
          this.displayDependencies() :
          <div> {`${ownerrepo || 'blank/blank'}`} is invalid. Please input a valid owner/repo combo. </div>}
    </div>);
  }
}

BoilerplateStats.defaultProps = {
  doc: { title: '', url: '' },
  ownerrepo: '',
};

BoilerplateStats.propTypes = {
  doc: PropTypes.object,
  // history: PropTypes.object.isRequired,
  ownerrepo: PropTypes.string.isRequired,
};

export default BoilerplateStats;
