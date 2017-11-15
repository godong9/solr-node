/**
 * Created by godong on 2016. 3. 9..
 */
/*jshint browser:false*/
/**
 * Require modules
 */
var _ = require('underscore'),
  fetch = require('node-fetch'),
  logger =  require('log4js').getLogger('sole-node'),
  QueryString = require('querystring'),
  Query = require('./query');

/**
 * Solr Node Client
 *
 * @constructor
 *
 * @param {Object} options
 * @param {String} [options.host] - host address of Solr server
 * @param {Number|String} [options.port] - port number of Solr server
 * @param {String} [options.core] - client core name
 * @param {String} [options.rootPath] - solr root path
 * @param {String} [options.protocol] - request protocol ('http'|'https')
 * @param {String} [options.debugLevel] - log4js debug level ('ALL'|'DEBUG'|'INFO'|'ERROR'|...)
 */
function Client(options) {
  this.options = {
    host: options.host || '127.0.0.1',
    port: options.port || '8983',
    core: options.core || '',
    rootPath: options.rootPath || 'solr',
    protocol: options.protocol || 'http'
  };

  if (options.debugLevel) {
    logger.setLevel(options.debugLevel);
  }

  // Path Constants List
  this.SEARCH_PATH = 'select';
  this.TERMS_PATH = 'terms';
  this.SPELL_PATH = 'spell';
  this.MLT_PATH = 'mlt';
  this.UPDATE_PATH = 'update';
  this.UPDATE_EXTRACT_PATH = 'update/extract';
  this.PING_PATH = 'admin/ping';
}

/**
 * Make host url
 * @private
 *
 * @param {String} protocol - protocol ('http'|'https')
 * @param {String} host - host address
 * @param {String|Number} port - port number
 *
 * @returns {String}
 */
Client.prototype._makeHostUrl = function(protocol, host, port) {
  if (port) {
    return protocol + '://' + host + ':' + port;
  } else {
    return protocol + '://' + host;
  }
};

/**
 * Request get
 *
 * @param {String} path - target path
 * @param {Object|String} query - query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {undefined|Promise} - When there's no callback function it returns a PromiseŰ
 */
Client.prototype._requestGet = function(path, query, finalCallback) {
  var params, options, requestPrefixUrl, requestFullPath;

  if (query instanceof Query) {
    params = query.toString();
  } else if (_.isString(query)) {
    params = query;
  } else {
    params = 'q=*:*';
  }
  requestPrefixUrl = this._makeHostUrl(this.options.protocol, this.options.host, this.options.port);
  requestPrefixUrl += '/' + [this.options.rootPath, this.options.core, path].filter(function (e) { return e; }).join('/');

  requestFullPath = requestPrefixUrl + '?' + params;

  logger.debug('[_requestGet] requestFullPath: ', requestFullPath);

  options = {
    method: 'GET',
    headers: {
      'accept' : 'application/json; charset=utf-8'
    }
  };
  var result = fetch(requestFullPath, options)
    .then(function(res) {
      if (res.status !== 200) {
        logger.error(res);
        throw new Error('Solr server error: ' + res.status);
      } else {
        return res.json();
      }
    });
  if (typeof finalCallback === 'function') {
    result
      .then(function(json) {
        finalCallback(null,json);
      })
      .catch(function (err) {
        finalCallback(err.message);
      });
  } else {
    return result;
  }
};

/**
 * Request post
 *
 * @param {String} path - target path
 * @param {Object} data - json data
 * @param {Object|String} urlOptions - url options
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {undefined|Promise} - When there's no callback function it returns a PromiseŰ
 */
Client.prototype._requestPost = function(path, data, urlOptions, finalCallback) {
  var params, options, requestPrefixUrl, requestFullPath;

  if (_.isString(urlOptions)) {
    params = urlOptions;
  } else if (_.isObject(urlOptions)) {
    params = QueryString.stringify(urlOptions);
  } else {
    params = '';
  }

  requestPrefixUrl = this._makeHostUrl(this.options.protocol, this.options.host, this.options.port);
  requestPrefixUrl += '/' + [this.options.rootPath, this.options.core, path].filter(function (e) { return e; }).join('/');

  requestFullPath = requestPrefixUrl + '?' + params;

  logger.debug('[_requestPost] requestFullPath: ', requestFullPath);
  logger.debug('[_requestPost] data: ', data);

  options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'accept' : 'application/json; charset=utf-8',
      'content-type' : 'application/json; charset=utf-8'
    }
  };
  var result = fetch(requestFullPath, options)
    .then(function(res) {
      if (res.status !== 200) {
        throw new Error('Solr server error: ' + res.status);
      } else {
        return res.json();
      }
    });

  if (typeof finalCallback === 'function') {
    result
      .then(function(json) {
        finalCallback(null,json);
      })
      .catch(function (err) {
        finalCallback(err.message);
      });
  } else {
    return result;
  }
};

/**
 * Make Query instance and return
 *
 * @returns {Object}
 */
Client.prototype.query = function() {
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
Client.prototype.search = function(query, finalCallback) {
  if (typeof finalCallback === 'function') {
    this._requestGet(this.SEARCH_PATH, query, finalCallback);
  } else {
    return this._requestGet(this.SEARCH_PATH, query);
  }
};
/**
 * Terms
 *
 * @param {Object|String} query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.terms = function(query, finalCallback) {
  if (typeof finalCallback === 'function') {
    this._requestGet(this.TERMS_PATH, query, finalCallback);
  } else {
    return this._requestGet(this.TERMS_PATH, query);
  }
};

/**
 * Mlt
 *
 * @param {Object|String} query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.mlt = function(query, finalCallback) {
  if (typeof finalCallback === 'function') {
    this._requestGet(this.MLT_PATH, query, finalCallback);
  } else {
    return this._requestGet(this.MLT_PATH, query);
  }
};

/**
 * Spell
 *
 * @param {Object|String} query
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.spell = function(query, finalCallback) {
  if (typeof finalCallback === 'function') {
    this._requestGet(this.SPELL_PATH, query, finalCallback);
  } else {
    return this._requestGet(this.SPELL_PATH, query);
  }
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
Client.prototype.update = function(data, options, finalCallback) {
  var bodyData;
  if (arguments.length < 3 && _.isFunction(options)) {
    finalCallback = options;
    options = { commit: true }; // 'commit:true' option is default
  }
  bodyData = {
    add: {
      doc: data,
      overwrite: true
    }
  };
  if (typeof finalCallback === 'function') {
    this._requestPost(this.UPDATE_PATH, bodyData, options, finalCallback);
  } else {
    return this._requestPost(this.UPDATE_PATH, bodyData, options);
  }
};

/**
 * Update Extract (files to be indexed via Tika using stream.* param)
 *
 * @param {Object|Function} [options] - update options
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.updateExtract = function(options, finalCallback) {
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
      overwrite: true
    }
  };
  if (typeof finalCallback === 'function') {
    this._requestPost(this.UPDATE_EXTRACT_PATH, bodyData, options, finalCallback);
  } else {
    return this._requestPost(this.UPDATE_EXTRACT_PATH, bodyData, options);
  }
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
Client.prototype.delete = function(query, options, finalCallback) {
  var bodyData, bodyQuery;
  if (arguments.length < 3 && _.isFunction(options)) {
    finalCallback = options;
    options = { commit: true }; // 'commit:true' option is default
  }

  if (_.isString(query)) {
    bodyQuery = query;
  } else if (_.isObject(query)) {
    bodyQuery = QueryString.stringify(query, ' AND ', ':');
  } else {
    bodyQuery = '';
  }

  bodyData = {
    'delete': {
      query: bodyQuery
    }
  };

  if (typeof finalCallback === 'function') {
    this._requestPost(this.UPDATE_PATH, bodyData, options, finalCallback);
  } else {
    return this._requestPost(this.UPDATE_PATH, bodyData, options);
  }
};

/**
 * Ping
 *
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.ping = function(finalCallback) {
  if (typeof finalCallback === 'function') {
    this._requestGet(this.PING_PATH, '', finalCallback);
  } else {
    return this._requestGet(this.PING_PATH, '');
  }
};

/**
 * Commit
 *
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.commit = function(finalCallback) {
  if (typeof finalCallback === 'function') {
    this._requestPost(this.UPDATE_PATH, {}, {commit: true}, finalCallback);
  } else {
    return this._requestPost(this.UPDATE_PATH, {}, {commit: true});
  }
};

/**
 * SoftCommit
 *
 * @param {Function} finalCallback - (err, result)
 *
 * @returns {Undefined|Promise}
 */
Client.prototype.softCommit = function(finalCallback) {
  if (typeof finalCallback === 'function') {
    this._requestPost(this.UPDATE_PATH, {}, {softCommit: true}, finalCallback);
  } else {
    return this._requestPost(this.UPDATE_PATH, {}, {softCommit: true});
  }
};


module.exports = Client;
