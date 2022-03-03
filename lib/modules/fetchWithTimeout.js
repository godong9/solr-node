var fetch = require("node-fetch").default;

function fetchWithTimeout(url, options, timeout = 7000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `solr-node fetch timeout reached. Timeout set to: ${timeout} ms`
            )
          ),
        timeout
      )
    ),
  ]);
}

module.exports = fetchWithTimeout;
