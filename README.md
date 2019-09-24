# solr-node

Simple Solr Node Client Project

[![NPM](https://nodei.co/npm/solr-node.png?downloads=true&stars=true)](https://nodei.co/npm/solr-node/)

[![codecov](https://codecov.io/gh/godong9/solr-node/branch/master/graph/badge.svg)](https://codecov.io/gh/godong9/solr-node)
[![bitHound Dependencies](https://www.bithound.io/github/godong9/solr-node/badges/dependencies.svg)](https://www.bithound.io/github/godong9/solr-node/master/dependencies/npm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


## Install

```
npm install solr-node
```

## Usage
- Client: http://godong9.github.io/solr-node/docs/Client.html
- Query: http://godong9.github.io/solr-node/docs/Query.html

### Create Client

```js
// Require module
var SolrNode = require('solr-node');

// Create client
var client = new SolrNode({
    host: '127.0.0.1',
    port: '8983',
    core: 'test',
    protocol: 'http'
});

// Set logger level (can be set to DEBUG, INFO, WARN, ERROR, FATAL or OFF)
require('log4js').getLogger('solr-node').level = 'DEBUG';
```

### Search

Search can be executed with a simple text query or an object query.

#### Text

Text queries are similar to what one would find on the SOLR Core UI, EX:

From the URL: `http://localhost:8080/solr/products/select?q=*%3A*&wt=json`

The Query would be:

```
*:*&wt=json
```

NOTE: url decoded ':' from `%3A`.

#### Object

Object based queries can be simple or complex using chaining. Each method of the Query object returns an instance of itself.

Examples:

Simple:

```
client.query().q({text:'test', title:'test'});
```

Complex and chained:

```
client.query()
    .q({text:'test', title:'test'})
    .addParams({
        wt: 'json',
        indent: true
    })
    .start(1)
    .rows(1)
;
```

### Query Examples

```js
// Create query
var strQuery = client.query().q('text:test');
var objQuery = client.query().q({text:'test', title:'test'});
var myStrQuery = 'q=text:test&wt=json';

// Search documents using strQuery
solrClient.search(strQuery, function (err, result) {
   if (err) {
      console.log(err);
      return;
   }
   console.log('Response:', result.response);
});

// Search documents using objQuery
solrClient.search(objQuery, function (err, result) {
   if (err) {
      console.log(err);
      return;
   }
   console.log('Response:', result.response);
});

// Search documents using myStrQuery
solrClient.search(myStrQuery, function (err, result) {
   if (err) {
      console.log(err);
      return;
   }
   console.log('Response:', result.response);
});

```

### Update

```js
// JSON Data
var data = {
    text: 'test',
    title: 'test'
};

// Update document to Solr server
client.update(data, function(err, result) {
   if (err) {
      console.log(err);
      return;
   }
   console.log('Response:', result.responseHeader);
});

```

### Delete

```js
// Delete Query
var strQuery = 'id:testid'
var objQuery = {id:'testid'}

// Delete document using strQuery
client.delete(strQuery, function(err, result) {
   if (err) {
      console.log(err);
      return;
   }
   console.log('Response:', result.responseHeader);
});

// Delete document using objQuery
client.delete(objQuery, function(err, result) {
   if (err) {
      console.log(err);
      return;
   }
   console.log('Response:', result.responseHeader);
});

```

### Promise support

Skip the callback to get a promise back. ie:
```js
var result = solrClient.search(query)
    .then(function(result) {
      console.log('Response:', result.response);
    })
    .catch(function(err) {
      console.error(err);
    });
```

You can also use `async`/`await`:

```js
try {
   const result = await solrClient.search(query);
   console.log('Response:', result.response);
} catch(e) {
   console.error(err);
}
```

## Test & Coverage & Docs

```
gulp
```
