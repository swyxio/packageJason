import React from 'react';
import Icon from '../../components/Icon/Icon';

import './Logout.scss';

const Logout = () => (
  <div className="Logout">
    <img
      src="/packagejason.png"
      alt="Package Jason"
    />
    <h1>Stay safe out there.</h1>
    <p>{'Don\'t forget to like and follow PackageJason elsewhere on the web:'}</p>
    <ul className="FollowUsElsewhere">
      <li><a href="https://twitter.com/swyx"><Icon icon="twitter" /></a></li>
      <li><a href="https://twitter.com/packagejason"><Icon icon="twitter" /></a></li>
      <li><a href="https://github.com/cleverbeagle"><Icon icon="github" /></a></li>
    </ul>
  </div>
);

Logout.propTypes = {};

export default Logout;
