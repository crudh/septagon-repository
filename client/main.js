/* global document */
import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import routes from './routes/routes';
import reducer from './reducers/reducers';

const nodeEnv = process.env.NODE_ENV || 'development';

const middlewares = [
  thunk
];

if (nodeEnv === 'development') {
  console.log('[Development mode activated]');
  middlewares.push(createLogger());
}

const store = createStore(
  reducer,
  applyMiddleware(...middlewares)
);

injectTapEventPlugin();
const history = syncHistoryWithStore(browserHistory, store);
const rootElement = document.getElementById('root');

try {
  render(
    <Provider store={store}>
      <Router history={history}>
        {routes}
      </Router>
    </Provider>,
    rootElement
  );
} catch (error) {
  if (nodeEnv === 'development') {
    throw error;
  } else {
    // TODO better production handling of errors later
    throw error;
  }
}
