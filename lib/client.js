/**
 * Created by godong on 2016. 3. 9..
 */
/*jshint browser:false*/
/**
 * Require modules
 */
var _ = require("underscore"),
  fetch = require("node-fetch").default,
  logger = require("@log4js-node/log4js-api").getLogger("solr-node"),
  QueryString = require("querystring"),
  Query = require("./query");

/**
 * Solr Node Client
 *
 * @constructor
 *
 * @param {Object} options
 * @param {String} [options.host] - host address of Solr server
 * @param {Number|String} [options.port] - port number of Solr server
 * @param {String} [options.core] - client core name
 * @param {String} [options.user] - client user name
 * @param {String} [options.password] - client password name
 * @param {String} [options.rootPath] - solr root path
 * @param {String} [options.protocol] - request protocol ('http'|'https')
 * @param {String} [options.requestHandler] - request handler ('select' | custom)
 */
function Client(options) {
  this.options = {
    host: options.host || "127.0.0.1",
    port: options.port || "8983",
    core: options.core || "",
    rootPath: options.rootPath || "solr",
    protocol: options.protocol || "http",
    requestHandler: options.requestHandler || "select"
  };
  // Optional Authentication
  if (options.user && options.password) {
    this.options.user = options.user;
    this.options.password = options.password;
  }

  // Path Constants List
  this.SEARCH_PATH = this.options.requestHandler;
  this.TERMS_PATH = "terms";
  this.SPELL_PATH = "spell";
  this.MLT_PATH = "mlt";
  this.UPDATE_PATH = "update";
  this.UPDATE_EXTRACT_PATH = "update/extract";
  this.PING_PATH = "admin/ping";
  this.SUGGEST_PATH = "suggest";
}

/**
 * Make host url
 * @private
 *
 * @param {String} protocol - protocol ('http'|'https')
 * @param {String} host - host address
 * @param {String|Number} port - port number
 * @param {String} user - user basic auth
 * @param {String} password - password basic auth
 *
 * @returns {String}
 */
Client.prototype._makeHostUrl = function (
  protocol,
  host,
  port,
  user,
  password
) {
  let auth = "";
  if (user && password) {
    auth = user + ":" + password + "@";
  }
  if (port) {
    return protocol + "://" + auth + host + ":" + port;
  } else {
    return protocol + "://" + auth + host;
  }
};

/**
 * Make a call to Solr server
 * @private
 *
 * @param requestFullPath - URL sent to Solr server
 * @param {Object} fetchOptions - options for fetch method
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {undefined|Promise} - When there's no callback function it returns a Promise
 */
Client.prototype._callSolrServer = function (
  requestFullPath,
  fetchOptions,
  finalCallback
) {
  // var controller = new AbortController();
  // //default timeout is one second less than the lambda timeout
  // var defaultTimeout = process.env.SOLR_TIMEOUT || "20000";
  // var _fetchOptions = fetchOptions;
  // var timeout =
  //   (_fetchOptions === null || _fetchOptions === void 0
  //     ? void 0
  //     : _fetchOptions.timeout) || defaultTimeout;

  // var id = setTimeout(() => {
  //   console.log(
  //     `solr-node fetch timeout reached. Timeout set to: ${timeout} ms`
  //   );
  //   controller.abort();
  // }, timeout);

  // var result = fetch(requestFullPath, {
  //   ...fetchOptions,
  //   signal: controller.signal,
  // }).then(function (res) {
  var result = fetch(requestFullPath, fetchOptions).then(function (res) {
    if (res.status !== 200) {
      logger.error(res);
      throw new Error("Solr server error: " + res.status);
    } else {
      // clearTimeout(id);
      return res.json();
    }
  });
  if (typeof finalCallback === "function") {
    result
      .then(function (json) {
        finalCallback(null, json);
      })
      .catch(function (err) {
        finalCallback(err.message);
      });
  } else {
    return result;
  }
};

/**
 * Request get
 *
 * @param {String} path - target path
 * @param {Object|String} query - query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {undefined|Promise} - When there's no callback function it returns a Promise
 */
Client.prototype._requestGet = function (path, query, finalCallback) {
  var params, options, requestPrefixUrl, requestFullPath;

  if (query instanceof Query) {
    params = query.toString();
  } else if (_.isString(query)) {
    params = query;
  } else {
    params = "q=*:*";
  }
  requestPrefixUrl = this._makeHostUrl(
    this.options.protocol,
    this.options.host,
    this.options.port,
    this.options.user,
    this.options.password
  );
  requestPrefixUrl +=
    "/" + [this.options.rootPath, this.options.core, path].join("/");

  requestFullPath = requestPrefixUrl + "?" + params;

  logger.debug("[_requestGet] requestFullPath: ", requestFullPath);

  options = {
    method: "GET",
    headers: {
      accept: "application/json; charset=utf-8",
    },
  };

  return this._callSolrServer(requestFullPath, options, finalCallback);
};

/**
 * Request post
 *
 * @param {String} path - target path
 * @param {Object} data - json data
 * @param {Object|String} urlOptions - url options
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {undefined|Promise} - When there's no callback function it returns a Promise
 */
Client.prototype._requestPost = function (
  path,
  data,
  urlOptions,
  finalCallback
) {
  var params, options, requestPrefixUrl, requestFullPath;

  if (_.isString(urlOptions)) {
    params = urlOptions;
  } else if (_.isObject(urlOptions)) {
    params = QueryString.stringify(urlOptions);
  } else {
    params = "";
  }

  requestPrefixUrl = this._makeHostUrl(
    this.options.protocol,
    this.options.host,
    this.options.port,
    this.options.user,
    this.options.password
  );
  requestPrefixUrl +=
    "/" + [this.options.rootPath, this.options.core, path].join("/");

  requestFullPath = requestPrefixUrl + "?" + params;

  logger.debug("[_requestPost] requestFullPath: ", requestFullPath);
  logger.debug("[_requestPost] data: ", data);

  options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      accept: "application/json; charset=utf-8",
      "content-type": "application/json; charset=utf-8",
    },
  };

  return this._callSolrServer(requestFullPath, options, finalCallback);
};

/**
 * Make Query instance and return
 *
 * @returns {Object}
 */
Client.prototype.query = function () {
  return new Query();
};

/**
 * Search
 *
 * @param {Object|String} query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.search = function (query, finalCallback) {
  return this._requestGet(this.SEARCH_PATH, query, finalCallback);
};
/**
 * Terms
 *
 * @param {Object|String} query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.terms = function (query, finalCallback) {
  return this._requestGet(this.TERMS_PATH, query, finalCallback);
};

/**
 * Mlt
 *
 * @param {Object|String} query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.mlt = function (query, finalCallback) {
  return this._requestGet(this.MLT_PATH, query, finalCallback);
};

/**
 * Spell
 *
 * @param {Object|String} query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.spell = function (query, finalCallback) {
  return this._requestGet(this.SPELL_PATH, query, finalCallback);
};

/**
 * Update
 *
 * @param {Object} data - json data
 * @param {Object|Function} [options] - update options
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.update = function (data, options, finalCallback) {
  var bodyData;
  if (arguments.length < 3 && (!options || _.isFunction(options))) {
    finalCallback = options;
    options = { commit: true }; // 'commit:true' option is default
  }

  if (Array.isArray(data)) {
    bodyData = data;
  } else {
    bodyData = {
      add: {
        doc: data,
        overwrite: true,
      },
    };
  }

  return this._requestPost(this.UPDATE_PATH, bodyData, options, finalCallback);
};

/**
 * Update Extract (files to be indexed via Tika using stream.* param)
 *
 * @param {Object|Function} [options] - update options
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.updateExtract = function (options, finalCallback) {
  var bodyData;
  if (arguments.length < 2 && _.isFunction(options)) {
    finalCallback = options;
    options = { commit: true }; // 'commit:true' option is default
  }
  // We need JSON response
  options.wt = "json";
  bodyData = {
    add: {
      doc: null,
      overwrite: true,
    },
  };

  return this._requestPost(
    this.UPDATE_EXTRACT_PATH,
    bodyData,
    options,
    finalCallback
  );
};

/**
 * Delete
 *
 * @param {String|Object} query - query
 * @param {Object|Function} [options] - delete options
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.delete = function (query, options, finalCallback) {
  var bodyData, bodyQuery;
  if (arguments.length < 3 && _.isFunction(options)) {
    finalCallback = options;
    options = { commit: true }; // 'commit:true' option is default
  }

  if (_.isString(query)) {
    bodyQuery = query;
  } else if (_.isObject(query)) {
    bodyQuery = QueryString.stringify(query, " AND ", ":");
  } else {
    bodyQuery = "";
  }

  bodyData = {
    delete: {
      query: bodyQuery,
    },
  };

  return this._requestPost(this.UPDATE_PATH, bodyData, options, finalCallback);
};

/**
 * Ping
 *
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.ping = function (finalCallback) {
  return this._requestGet(this.PING_PATH, "", finalCallback);
};

/**
 * Commit
 *
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.commit = function (finalCallback) {
  return this._requestPost(
    this.UPDATE_PATH,
    {},
    { commit: true },
    finalCallback
  );
};

/**
 * SoftCommit
 *
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.softCommit = function (finalCallback) {
  return this._requestPost(
    this.UPDATE_PATH,
    {},
    { softCommit: true },
    finalCallback
  );
};

/**
 * Suggest Component
 *
 * @param {Object|String} query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.suggest = function (query, finalCallback) {
  return this._requestGet(this.SUGGEST_PATH, query, finalCallback);
};

module.exports = Client;
