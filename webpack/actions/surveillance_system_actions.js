import axios from 'axios';
import routes from '../routes';
import { getCSRFToken } from './index';
import {
  FETCH_SURVEILLANCE_SYSTEMS,
  ADD_SYSTEM
} from './types';

export function fetchSurveillanceSystems() {
  return {
    type: FETCH_SURVEILLANCE_SYSTEMS,
    payload: axios.get(routes.surveillanceSystemsPath(), {
      headers: {
        'X-Key-Inflection': 'camel',
        'Accept': 'application/json'
      }
    })
  };
}

export function addSystem(name, description=null, acronym=null, callback=null, failureHandler=null) {
  const postPromise = axios.post(routes.surveillanceSystemsPath(), {
    headers: {
      'X-Key-Inflection': 'camel',
      'Accept': 'application/json'
    },
    authenticityToken: getCSRFToken(),
    name, description, acronym
  });
  if (callback) {
    postPromise.then(callback);
  }
  if (failureHandler) {
    postPromise.catch(failureHandler);
  }
  return {
    type: ADD_SYSTEM,
    payload: postPromise
  };
}
