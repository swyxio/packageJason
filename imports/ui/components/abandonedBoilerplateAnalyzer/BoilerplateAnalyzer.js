/* eslint-disable max-len, no-return-assign */

/*
***** i abandoned this because it only means anything once i launch it
*****
*/




import React from 'react';
// import { Button } from 'react-bootstrap';
import { FormGroup, ControlLabel, Button, Badge, Panel, Tooltip, OverlayTrigger } from 'react-bootstrap';

// https://github.com/sw-yx/sw-yx.github.io/blob/680bc005c4f98db3cf855768f38ae43f57d5afc5/_posts/2017-06-20-dont-pass-props-by-reference.md

class BoilerplateAnalyzer extends React.Component {
  constructor(props) {
    super(props);
    // this.onChange = this.onChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    // this.state = { items: this.props.items, text: '' };
    this.state = {
      ownerrepo: this.props.owner,
      data: null,
      tree: null,
      cogload: 0,
      intload: 0,
      extlod: 0,
    };
  }

  onChange(e) {
    this.setState({ text: e.target.value });
  }

  handleSubmit() {
    const newItem = this.state.items ? this.state.items : [];
    const text = this.state.text;
    newItem.push(text);
    const newText = '';
    this.setState({ items: newItem, text: newText });
  }
  handleDelete(item) {
    const newItem = this.state.items;
    newItem.splice(newItem.indexOf(item), 1);
    this.setState({ items: newItem });
  }
  render() {
    return (
      <div className="container">
        <div className="inside-box">
          <b>Featured guests:</b>
        </div>
        <ul>{this.state.items && this.state.items.map((item, i) => {
          return <li key={i}><span>{item}</span><Button onClick={() => this.handleDelete(item)}>x</Button></li>;
        })}
        </ul>
        <input
          type="text"
          onChange={this.onChange}
          name="addguest"
          value={this.state.text}
          placeholder="Add guest..."
        />
        <Button onClick={() => this.handleSubmit()}>Add</Button>
      </div>
    );
  }
}

export default BoilerplateAnalyzer;
