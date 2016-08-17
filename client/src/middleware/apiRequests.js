
import axios from 'axios';
// import _ from 'lodash';
// import * as jsonApiTypes from "jsonApi/actionTypes";

// import { displayErrorModal } from 'notification/actions'
import Console from "utils/console";

const apiMimeType = 'application/x-vnd.alces-software.webapp.api+json;version=1'
const jsonApiMimeType = "application/vnd.api+json";

axios.defaults.headers.common['Accept'] = [
  jsonApiMimeType,
  apiMimeType,
  'application/json',
];

// function addHeaders(config, csrfToken) {
//   const headers = config.headers || {};
//   headers['X-CSRF-Token'] = csrfToken;
//   headers['Content-Type'] = headers['Content-Type'] || apiMimeType;
//   config.headers = headers;

//   return config;
// }

// Return an object containing the action's meta without the apiRequest key.
function metaWithoutApiRequest(action) {
  const newActionMeta = {
    meta: {
      ...action.meta,
    },
  };

  if (Object.keys(newActionMeta.meta).length === 1) {
    // No arguments beside apiRequest, remove all meta.
    delete newActionMeta.meta;
  } else {
    // Other arguments, delete apiRequest only.
    delete newActionMeta.meta.apiRequest;
  }

  return newActionMeta;
}

function errorFromResponse(response) {
  const data = response.data;
  if (data.errors) return data.errors;
  if (data.error)  return data.error;
  // We've probably got a string response. If its an error message from Rails
  // it could be very large we don't want to allow all of it to travel through
  // the redux stack.
  try {
    if (data.length > 512) {
      const substring = data.slice(0, 512);
      Console.warn(`Limiting error message to first 512 of ${data.length} bytes`);
      return substring;
    } else {
      return data;
    }
  } catch(e) {
    // Apparently not a string. Let's just return it all.
    return data;
  }
}

// function dispatchIncludedResources(dispatch, response, doNotSplitIncludes) {
//   if (response.headers["content-type"] === jsonApiMimeType) {
//     const includedResourcesByType = _.groupBy(response.data.included, "type");
//     _.forOwn(includedResourcesByType, (resources, type) => {
//       dispatch({
//         type: jsonApiTypes.ADD_INCLUDED_RESOURCES,
//         meta: {
//           type: type
//         },
//         payload: resources
//       });
//     });
//     if (doNotSplitIncludes) {
//       return response.data;
//     } else {
//       return response.data.data;
//     }
//   } else {
//     return response.data;
//   }
// }

function apiRequestMiddleware({dispatch}) {
  return function(nextMiddleware) {
    return function(action) {
      if (action.meta && action.meta.apiRequest) {
        const apiRequest = action.meta.apiRequest;
        // addHeaders(apiRequest.config, getState().auth.csrfToken);

        const newAction = {
          type: action.type,
          payload: {
            promise: axios(apiRequest.config).then(
              // (response) => dispatchIncludedResources(dispatch, response, apiRequest.doNotSplitIncludes),
              (response) => response.data,
              (response) => {
                const error = errorFromResponse(response);
                //dispatch(displayErrorModal(action, response));
                throw error;
              }
            ),
            ...action.payload,
          },
          ...metaWithoutApiRequest(action),
        };

        return dispatch(newAction);

      } else {
        return nextMiddleware(action);
      }
    }
  }
}

export default apiRequestMiddleware;
