import React, { PropTypes } from 'react';

const App = ({ children }) => (
  <div>
    <div>
      App
    </div>
    <div>
      {children}
    </div>
  </div>
);

App.defaultProps = {
  children: null
};
App.propTypes = {
  children: PropTypes.node
};

export default App;
