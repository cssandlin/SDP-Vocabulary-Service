import axios from 'axios';
import { normalize } from 'normalizr';
import { surveySchema } from '../schema';
import routes from '../routes';
import { deleteObject } from './action_helpers';
import { getCSRFToken } from './index';
import {
  SAVE_SURVEY,
  SAVE_DRAFT_SURVEY,
  CREATE_SURVEY,
  PUBLISH_SURVEY,
  ADD_SURVEY_TO_GROUP,
  REMOVE_SURVEY_FROM_GROUP,
  DELETE_SURVEY,
  ADD_ENTITIES,
  UPDATE_SURVEY_TAGS
} from './types';


export function newSurvey() {
  return {
    type: CREATE_SURVEY
  };
}

export function deleteSurvey(id, callback=null) {
  return {
    type: DELETE_SURVEY,
    payload: deleteObject(routes.surveyPath(id), callback)
  };
}

export function fetchSurvey(id) {
  return {
    type: ADD_ENTITIES,
    payload: axios.get(routes.surveyPath(id), {
      headers: {
        'X-Key-Inflection': 'camel',
        'Accept': 'application/json'
      }
    }).then((surveyResponse) => {
      const normalizedData = normalize(surveyResponse.data, surveySchema);
      return normalizedData.entities;
    })
  };
}

export function publishSurvey(id) {
  const authenticityToken = getCSRFToken();
  return {
    type: PUBLISH_SURVEY,
    payload: axios.put(routes.publishSurveyPath(id),
     {authenticityToken}, {headers: {'X-Key-Inflection': 'camel', 'Accept': 'application/json'}})
  };
}

export function addSurveyToGroup(id, group) {
  const authenticityToken = getCSRFToken();
  return {
    type: ADD_SURVEY_TO_GROUP,
    payload: axios.put(routes.addToGroupSurveyPath(id),
     {authenticityToken, group}, {headers: {'X-Key-Inflection': 'camel', 'Accept': 'application/json'}})
  };
}

export function removeSurveyFromGroup(id, group) {
  const authenticityToken = getCSRFToken();
  return {
    type: REMOVE_SURVEY_FROM_GROUP,
    payload: axios.put(routes.removeFromGroupSurveyPath(id),
     {authenticityToken, group}, {headers: {'X-Key-Inflection': 'camel', 'Accept': 'application/json'}})
  };
}

export function saveSurvey(survey, successHandler=null, failureHandler=null) {
  const fn = axios.post;
  const postPromise = createPostPromise(survey, routes.surveysPath(), fn, successHandler, failureHandler);
  return {
    type: SAVE_SURVEY,
    payload: postPromise
  };
}

export function saveDraftSurvey(survey, successHandler=null, failureHandler=null) {
  const fn = axios.put;
  const postPromise = createPostPromise(survey, routes.surveyPath(survey.id), fn, successHandler, failureHandler);
  return {
    type: SAVE_DRAFT_SURVEY,
    payload: postPromise
  };
}

export function updateSurveyTags(id, conceptsAttributes) {
  const authenticityToken  = getCSRFToken();
  const putPromise = axios.put(routes.update_tags_survey_path(id),
                      {id, authenticityToken, conceptsAttributes},
                      {headers: {'X-Key-Inflection': 'camel', 'Accept': 'application/json'}});
  return {
    type: UPDATE_SURVEY_TAGS,
    payload: putPromise
  };
}

function createPostPromise(survey, url, fn, successHandler=null, failureHandler=null) {
  const authenticityToken = getCSRFToken();
  survey.questionsAttributes = survey.questions;
  delete survey.showModal;
  delete survey.progSysModalOpen;
  const postPromise = fn(url,
                      {survey, authenticityToken},
                      {headers: {'X-Key-Inflection': 'camel', 'Accept': 'application/json'}});
  if (successHandler) {
    postPromise.then(successHandler);
  }
  if (failureHandler) {
    postPromise.catch(failureHandler);
  }

  return postPromise;
}
