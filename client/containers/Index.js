import React, { Component } from 'react';
import request from '../utils/request';

class Index extends Component {
  componentDidMount() {
    request('/admin/config/repos').then(
      ({ json }) => console.info('success', json),
      error => console.error('fail', error)
    );
  }

  render() {
    return (
      <div>
        Index
      </div>
    );
  }
}

export default Index;
