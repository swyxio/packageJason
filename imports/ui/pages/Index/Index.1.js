import React from 'react';
import { Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';

import './Index.scss';

const Index = () => {
  console.log('pkgjson', this);
  console.log('Meteor', Meteor);
  return (
    <div className="Index">
      <img
        src="https://s3-us-west-2.amazonaws.com/cleverbeagle-assets/graphics/email-icon.png"
        alt="Clever Beagle"
      />
      <h1>PackageJason</h1>
      <p>A boilerplate search engine.</p>
      <div>
        <Button href="http://cleverbeagle.com/pup">Read the Docs</Button>
        <Button href="https://github.com/cleverbeagle/pup"><i className="fa fa-star" /> Star on GitHub</Button>
      </div>
      <footer>
        <p>Need help and want to stay accountable building your product? <a href="http://cleverbeagle.com?utm_source=pupappindex&utm_campaign=oss">Check out Clever Beagle</a>.</p>
      </footer>
    </div>
  );
};

export default Index;

// import React from 'react';
// import PropTypes from 'prop-types';
// import { createContainer } from 'meteor/react-meteor-data';
// import { Button } from 'react-bootstrap';
// // import { Meteor } from 'meteor/meteor';
// // import Boilerplates from '../../../api/Boilerplates/Boilerplates';
// // import BoilerplateEditor from '../../components/BoilerplateEditor/BoilerplateEditor';
// // import NotFound from '../NotFound/NotFound';

// const Index = ({ match }) => {
//   const owner = match.params && match.params.owner;
//   const repo = match.params && match.params.repo;
//   return (
//     <div className="Index">
//       <img
//         src="https://s3-us-west-2.amazonaws.com/cleverbeagle-assets/graphics/email-icon.png"
//         alt="Clever Beagle"
//       />
//       <h1>PackageJason : {owner}/{repo}</h1>
//       <p>A boilerplate search engine.</p>
//       <div>
//         <Button href="http://cleverbeagle.com/pup">Read the Docs</Button>
//         <Button href="https://github.com/cleverbeagle/pup"><i className="fa fa-star" /> Star on GitHub</Button>
//       </div>
//       <footer>
//         <p>Need help and want to stay accountable building your product? <a href="http://cleverbeagle.com?utm_source=pupappindex&utm_campaign=oss">Check out Clever Beagle</a>.</p>
//       </footer>
//     </div>
//   );
// };


// Index.defaultProps = {
//   match: {},
// };

// Index.propTypes = {
//   match: PropTypes.object,
// };

// export default createContainer(() => {
// }, Index);
