/* eslint-disable max-len, no-return-assign */

import axios from 'axios';
import React from 'react';
import ReactGauge from 'react-gauge-test';
import PropTypes from 'prop-types';
import { Badge, Panel, Tooltip, OverlayTrigger, Grid, Row, Col, Button, Well } from 'react-bootstrap';
import { TwitterButton } from 'react-social';
// import { Meteor } from 'meteor/meteor';
// import { Bert } from 'meteor/themeteorchef:bert';

const emojirange = ['❗', '😓', '👎', '👍', '🙂', '⭐', '🔥'];
const range7 = [{
  start: 0,
  end: 1 / 7,
  color: '#f00',
},
{
  start: 1 / 7,
  end: 2 / 7,
  color: '#ff7f00',
},
{
  start: 2 / 7,
  end: 3 / 7,
  color: '#ffff00',
},
{
  start: 3 / 7,
  end: 4 / 7,
  color: '#00bc3f',
},
{
  start: 4 / 7,
  end: 5 / 7,
  color: '#0068ff',
},
{
  start: 5 / 7,
  end: 6 / 7,
  color: '#7a00e5',
},
{
  start: 6 / 7,
  end: 1,
  color: '#bc31fe',
}];

class BoilerplateStats extends React.Component {
  constructor(props) {
    super(props);
    this.state = { data: null, tree: null, repo: null, failed_ownerrepo: [], currentrepo: ''};
  }
  componentDidMount() {
    if (this.props.doc) {
      this.getDetails();
    }
    // twttr.ready(() => {
    //   twttr.widgets.createTimeline(widgetId, this.refs.container)
    // })
    // twttr.widgets.load();
  }

  getDetails() {
    const ownerrepo = this.props.ownerrepo;
    // console.log('this.state.failed_ownerrepo', this.state.failed_ownerrepo);
    // console.log('this.state.failed_ownerrepo ownerrepo', ownerrepo);
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
      // console.log('newfailrepo', newfailrepo);
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
    // const objTitle = this.state.data.title || this.state.data.name;
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
    const { match } = this.props;
    const link = match.url;
    let emojinum = ((Math.tanh(this.state.popScore / this.state.cogload) + 1) / 2) * 7;
    emojinum = emojinum > 0 ? emojinum - 0.001 : emojinum + 0.001;
    emojinum = Math.max(0, Math.floor(emojinum));
    const or = this.props.ownerrepo.split('/');
    const message = `@${or[0]} /${or[1]} @PackageJason score is ${Math.floor((this.state.popScore / this.state.cogload) * 100) / 100}${emojirange[emojinum]}! Check it: https://packagejason.herokuapp.com/${this.props.ownerrepo}`;
                // <a
                //   href="https://twitter.com/intent/tweet?screen_name=packageJason"
                //   className="twitter-mention-button"
                //   data-size="large"
                //   data-text={`${objTitle} @PackageJason score is ${Math.round((this.state.popScore / this.state.cogload) * 100) / 100}${emojirange[Math.round(Math.tanh(this.state.popScore / this.state.cogload) * 6)]}! ${this.props.match && this.props.match.url}`}
                //   data-related="PackageJane,swyx"
                //   data-show-count="false"
                // >
                //   Tweet this score!
                // </a>
    return (
      <div>
        <Grid style={{ paddingLeft: '0px', marginRight: '0px' }}>
          <Row>
            <Col xs={12} md={4}>
              <Panel
                header={
                  <h3>Cognitive Load
                    <OverlayTrigger placement="bottom" overlay={tooltipCognitiveLoad}>
                      <i> (<u>What is this?</u>)</i>
                    </OverlayTrigger>
                  </h3>
                }
                footer={
                  <span>Link to <a href={`https://github.com/${this.props.ownerrepo}/blob/master/package.json`} target="_blank">package.json</a></span>
                }
                bsStyle="danger"
              >
                <Well>
                  <h1 style={{ color: 'red', textAlign: 'center' }}>
                    <b>{Math.round(this.state.cogload)}</b>
                  </h1>
                </Well>
                <i>
                  50% External (<span style={{ color: 'red' }}>{this.state.data ? this.calcDependencyLoad(this.state.data) : ''}</span>)
                <ul>
                  <li>
                    <a href={`https://api.github.com/repos/${this.props.ownerrepo}/contents/package.json`} target="_blank">Total Dependencies</a>:
                    <span style={{ color: 'red' }}> {this.calcTotalDeps(this.state.data)}</span>
                  </li>
                </ul>
                  50% Internal (<span style={{ color: 'red' }}>{this.state.tree ? this.calcTreeLoad(this.state.tree) : ''}</span>)
                <ul>
                  <li>
                    <a href={`https://api.github.com/repos/${this.props.ownerrepo}/git/trees/master?recursive=1`} target="_blank"> Folder+Filecount</a>:
                    <span style={{ color: 'red' }}> {this.state.tree && this.state.tree.tree.length}{this.state.tree && this.state.tree.truncated ? '+' : ''}</span>
                  </li>
                  <li>
                    JS Filesize: <span style={{ color: 'red' }}>{this.state.tree && this.calcJSFileSize(this.state.tree.tree)}{this.state.tree && this.state.tree.truncated ? '+' : ''}</span>kb
                  </li>
                </ul>
                </i>
              </Panel>
            </Col>
            <Col xs={12} md={4}>
              <Panel header={<h3>Load vs Popularity Rating</h3>} bsStyle="primary" style={{ textAlign: 'center' }}>
                <h2>
                  <b>{this.props.ownerrepo}</b>
                  <a href={`https://github.com/${this.props.ownerrepo}`} target="_blank">🔗</a>
                </h2>
                <p>PackageJason Score:</p>
                <Well>
                  <h1 style={{ textAlign: 'center' }}>
                    <b>{Math.round((this.state.popScore / this.state.cogload) * 100) / 100}
                      {emojirange[emojinum]}
                    </b>
                  </h1>
                </Well>
                <ReactGauge
                  isInnerNumbers
                  arrowValue={(Math.tanh(this.state.popScore / this.state.cogload) + 1) / 2}
                  // aperture={180}
                  arcStrokeWidth={5}
                  marks={emojirange}
                  ranges={range7}
                  aperture={240}
                  radius={110}
                  contentWidth={250}
                  svgContainerWidth={350}
                  svgContainerHeight={150}
                />
                <br />
                <Button bsSize="large">
                  <TwitterButton title="Share via Twitter" message={message} url={link} element="a" className="">
                    <h3>Tell your Tweeps! <i className="fa fa-twitter-square" /></h3>
                  </TwitterButton>
                </Button>
              </Panel>
            </Col>
            <Col xs={12} md={4}>
              <Panel
                header={
                  <h3>Popularity Score
                    <OverlayTrigger placement="bottom" overlay={tooltipPopularityScore}>
                      <i> (<u>What is this?</u>)</i>
                    </OverlayTrigger>
                  </h3>
                }
                bsStyle="success"
              >
                <Well>
                  <h1 style={{ color: 'green', textAlign: 'center' }}> <b>{Math.round(this.state.popScore)}</b></h1>
                </Well>
                <i>Linear Addition of:
                  <ul>
                    <li>
                      Stars (<span style={{ color: 'green' }}>{this.state.starcount}</span>)
                    </li>
                    <li>
                      Forks (<span style={{ color: 'green' }}>{this.state.forkcount}</span>)
                    </li>
                    <li>
                      Subscribers (<span style={{ color: 'green' }}>{this.state.subscount}</span>)
                    </li>
                    <li>
                      Contributors (<span style={{ color: 'green' }}>{this.state.contributorcount}</span>)
                    </li>
                  </ul>
                </i>
                <i>Minus:
                  <ul>
                    <li>
                      Commit Age Penalty  (f(<span style={{ color: 'red' }}>{this.calcNumDaysSinceLastCommit(this.state.lastcommit)}</span>))
                    </li>
                  </ul>
                </i>
              </Panel>
            </Col>
          </Row>
        </Grid>
        <Panel header="Repo metadata" style={{ height: 400, overflowY: 'scroll' }}>
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
    const ownerrepo = this.props.ownerrepo;
    if (this.state.currentrepo !== ownerrepo) {
      this.setState({
        currentrepo: ownerrepo,
        data: null,
      });
    }
    // console.log('boilerplatestats ownerrepo', ownerrepo);
    // console.log('this.state.data', this.state.data);
    if (!this.state.data && ownerrepo.indexOf('/') + 1) this.getDetails();
    // if (!this.state.data && ownerrepo.indexOf('/') + 1 && ownerrepo.split('/')[1].length > 0) this.getDetails();
    return (<div>
      { this.state.data ?
          this.displayDependencies() :
          <div> {`${ownerrepo || 'blank/blank'}`} is invalid. Please input a valid owner/repo combo to see its PackageJason score!</div>}
    </div>);
  }
}

BoilerplateStats.defaultProps = {
  doc: { title: '', url: '' },
  ownerrepo: '',
  match: { url: '' },
};

BoilerplateStats.propTypes = {
  doc: PropTypes.object,
  match: PropTypes.object,
  // history: PropTypes.object.isRequired,
  ownerrepo: PropTypes.string.isRequired,
};

export default BoilerplateStats;
