
import debug from 'debug'
import Debug from 'redux-debug';
import promiseMiddleware from 'redux-simple-promise';
import { applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import apiRequestMiddleware from './apiRequests';
import logger from './logger';

const reduxDebug = debug('redux');

const enhanceWithMiddleware = applyMiddleware(
    apiRequestMiddleware,
    promiseMiddleware(),
    thunk,
    logger,
    Debug(reduxDebug)
);

export default enhanceWithMiddleware;
export { logger };
