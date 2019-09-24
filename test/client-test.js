/**
 * Created by godong on 2016. 3. 9..
 */
/* jshint expr: true */
/**
 * Require modules
 */
var chai = require('chai'),
  chaiAsPromised = require("chai-as-promised"),
  nock = require('nock'),
  Client = require('../lib/client');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Client', function() {
  var testClient = new Client({core: 'test'});
  before(function() {
    nock.disableNetConnect();
    nock.enableNetConnect(/127.0.0.1/);
    nock.cleanAll();
    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/error\/select.*/g, '/error/select/mock')
      .get('/error/select/mock')
      .reply(404);

    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/error\/update.*/g, '/error/update/mock')
      .post('/error/update/mock')
      .reply(404);

    nock('http://127.0.0.1:8983')
      .persist()
      .get('/solr/test/select?q=text:test&facet=true&facet.query=test&wt=json')
      .reply(200, JSON.stringify({
        responseHeader: {
          status: 0,
          QTime: 86,
          params: { q: 'text:test', wt: 'json' }
        },
        response:{
          numFound: 10,
          start: 0,
          docs: []
        },
        facet_counts:{
          facet_queries: {
            test: 18
          }
        }
      }));

    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/test\/select.*/g, '/test/select/mock')
      .get('/test/select/mock')
      .reply(200, JSON.stringify({
        responseHeader: {
          status: 0,
          QTime: 86,
          params: { q: 'text:test', wt: 'json' }
        },
        response:{
          numFound: 10,
          start: 0,
          docs: []
        }
      }));

    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/test\/terms.*/g, '/test/terms/mock')
      .get('/test/terms/mock')
      .reply(200, JSON.stringify({
        responseHeader: {
          status: 0,
          QTime: 86
        },
        terms:{
          text: []
        }
      }));

    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/test\/mlt.*/g, '/test/mlt/mock')
      .get('/test/mlt/mock')
      .reply(200, JSON.stringify({
        responseHeader: {
          status: 0,
          QTime: 86
        },
        response: {
          numFound: 10,
          start: 0,
          docs: []
        },
        moreLikeThis: {
          "testId1": {
            numFound: 10,
            start: 0,
            docs: []
          },
          "testId2": {
            numFound: 10,
            start: 0,
            docs: []
          }
        }
      }));

    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/test\/spell.*/g, '/test/spell/mock')
      .get('/test/spell/mock')
      .reply(200, JSON.stringify({
        responseHeader: {
          status: 0,
          QTime: 86
        },
        response: {
          numFound: 10,
          start: 0,
          docs: []
        },
        spellcheck:{
          suggestions: [],
          collations: []
        }
      }));

    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/test\/suggest.*/g, '/test/suggest/mock')
      .get('/test/suggest/mock')
      .reply(200, JSON.stringify({
        responseHeader: {
          status: 0,
          QTime: 86
        },
        suggest:{
          'testDictionary': {
            'tes':{
              numFound:2,
              suggestions:[]
            }
          }
        }
      }));

    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/test\/update.*/g, '/test/update/mock')
      .post('/test/update/mock')
      .reply(200, JSON.stringify({
        responseHeader: {
          status: 0,
          QTime: 86
        }
      }));

    nock('http://127.0.0.1:8983')
      .persist()
      .filteringPath(/\/solr\/test\/admin\/ping.*/g, '/test/admin/ping/mock')
      .get('/test/admin/ping/mock')
      .reply(200, JSON.stringify({
        responseHeader: {
          status: 0,
          QTime: 2
        }
      }));

  });

  after(function() {
    nock.cleanAll();
  });

  describe('#constructor', function() {
    it('should create default client.', function() {
      //given
      var options = {};
      //when
      var client = new Client(options);
      //then
      expect(client.options).to.eql({
        host: '127.0.0.1',
        port: '8983',
        core: '',
        rootPath: 'solr',
        protocol: 'http'
      });
    });

    it('should create client when core:"test".', function() {
      //given
      var options = {
        core: 'test',
      };
      //when
      var client = new Client(options);
      //then
      expect(client.options).to.eql({
        host: '127.0.0.1',
        port: '8983',
        core: 'test',
        rootPath: 'solr',
        protocol: 'http'
      });
    });

    it('should create client when user:"test" and password:"test".', function() {
      //given
      var options = {
        user: 'test',
	password: 'test'
      };
      //when
      var client = new Client(options);
      //then
      expect(client.options).to.eql({
        host: '127.0.0.1',
        port: '8983',
        core: '',
	user: 'test',
	password: 'test',
        rootPath: 'solr',
        protocol: 'http'
      });
    });

  });

  describe('#_makeHostUrl', function() {
    it('should get host url.', function() {
      //given
      var protocol = 'http';
      var host = '127.0.0.1';
      var port = '8983';
      //when
      var hostUrl = testClient._makeHostUrl(protocol, host, port);
      //then
      expect(hostUrl).to.equal('http://127.0.0.1:8983');
    });

    it('should get host url when port is empty and protocol is https.', function() {
      //given
      var protocol = 'https';
      var host = 'test.com';
      var port = '';
      //when
      var hostUrl = testClient._makeHostUrl(protocol, host, port);
      //then
      expect(hostUrl).to.equal('https://test.com');
    });

    it('should get host url when authentication is set.', function() {
      //given
      var protocol = 'https';
      var user = 'test';
      var password = 'test';
      var host = 'test.com';
      var port = '8983';
      //when
      var hostUrl = testClient._makeHostUrl(protocol, host, port, user, password);
      //then
      expect(hostUrl).to.equal('https://test:test@test.com:8983');
    });
  });

  describe('#_requestGet', function() {
    it('should get search error from server.', function(done) {
      //given
      var client = new Client({core: 'error'});
      //when
      client._requestGet(client.SEARCH_PATH, "q=*:*", function(err, result) {
        //then
        expect(err).to.equal('Solr server error: 404');
        expect(result).to.not.exist;
        done();
      });
    });

    it('should get notes data from server when query string.', function(done) {
      //given
      var client = new Client({core: 'test'});
      //when
      client._requestGet(client.SEARCH_PATH, 'q=text:text&wt=json', function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should get notes data from server when query is query instance.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query = client.query().q('text:test');
      //when
      client._requestGet(client.SEARCH_PATH, query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should get notes data from server when query is query instance but query is not string.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query = client.query().q(null);
      //when
      client._requestGet(client.SEARCH_PATH, query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should get notes data from server when query is string.', function(done) {
      //given
      var client = new Client({core: 'test'});
      //when
      client._requestGet(client.SEARCH_PATH, "q=*:*", function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should get notes data from server when query is null.', function(done) {
      //given
      var client = new Client({core: 'test'});
      //when
      client._requestGet(client.SEARCH_PATH, null, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should return a Promise when no callback is given', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var result = client._requestGet(client.SEARCH_PATH, null);
      //then
      return expect(result).to.be.a('promise');
    });

    it('should not return a Promise when a callback is given', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var result = client._requestGet(client.SEARCH_PATH, null, function(){});
      //then
      return expect(result).to.be.undefined;
    });

    it('should resolve with the data when it returns a Promise', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var result = client._requestGet(client.SEARCH_PATH, null);
      //then
      return expect(result).to.eventually.have.property('response');
    });

    it('should reject with error message when it returns a Promise', function() {
      //given
      var client = new Client({core: 'error'});
      //when
      var result = client._requestGet(client.SEARCH_PATH, null);
      //then
      return expect(result).to.be.rejectedWith('Solr server error: 404');
    });
  });

  describe('#_requestPost', function() {
    it('should get post error from server.', function(done) {
      //given
      var client = new Client({core: 'error'});
      //when
      client._requestPost(client.UPDATE_PATH, {}, {}, function(err, result) {
        //then
        expect(err).to.equal('Solr server error: 404');
        expect(result).to.not.exist;
        done();
      });
    });

    it('should post data to server when options is null.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var data = {
        test: 'test',
        title: 'test'
      };
      var options = null;
      //when
      client._requestPost(client.UPDATE_PATH, data, options, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should post data to server when options is object.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var data = {
        test: 'test',
        title: 'test'
      };
      //when
      client._requestPost(client.UPDATE_PATH, data, {}, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should post data to server when options is string.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var data = {
        test: 'test',
        title: 'test'
      };
      //when
      client._requestPost(client.UPDATE_PATH, data, 'commit=true', function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });
  });

  describe('#search', function() {
    it('should search data when not using query.', function(done) {
      //given
      var client = new Client({core: 'test'});
      //when
      client.search('q=text:test', function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should search data when query is string.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query = client.query().q('text:test');
      //when
      client.search(query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should search data when query is object.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .q({text:'test', title:'test'});
      //when
      client.search(query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should search data with query options.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .q({text:'test', title:'test'})
          .fl(['text', 'title'])
          .start(0)
          .rows(10)
          .sort({like:'desc'})
          .fq({field:'hate', value:0});

      //when
      client.search(query, function(err, result) {
        //then
        expect(query.params).to.eql([
          'q=text:test%20AND%20title:test',
          'fl=text,title',
          'start=0',
          'rows=10',
          'sort=like%20desc',
          'fq=hate%3A0'
        ]);

        expect(err).to.not.exist;
        expect(result.response).to.exist;
        done();
      });
    });

    it('should search data when query and facet query are exist.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .q({text:'test'})
          .facetQuery({query:'test'});

      //when
      client.search(query, function(err, result) {
        //then
        expect(query.params).to.eql([
          'q=text:test',
          'facet=true',
          'facet.query=test'
        ]);

        expect(err).to.not.exist;
        expect(result.response).to.exist;
        expect(result.facet_counts).to.exist;
        done();
      });
    });

    it('should return a Promise when no callback is given', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var query =
        client.query()
          .q({text:'test'})
          .facetQuery({query:'test'});

      var result = client.search(query);
      //then
      return expect(result).to.be.a('promise');
    });

    it('should not return a Promise when a callback is given', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var query =
        client.query()
          .q({text:'test'})
          .facetQuery({query:'test'});
      var result = client.search(query, function() {});
      //then
      return expect(result).to.be.undefined;
    });

    it('should resolve with the data when it returns a Promise', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var result = client.search('q=text:test');
      //then
      return expect(result).to.eventually.have.property('response');
    });

    it('should reject with error message when it returns a Promise', function() {
      //given
      var client = new Client({core: 'error'});
      //when
      var result = client.search('q=text:test');
      //then
      return expect(result).to.be.rejected;
    });
  });

  describe('#terms', function() {
    it('should get terms data.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .termsQuery({
            fl: 'text',
            prefix: 'te'
          });
      //when
      client.terms(query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.terms).to.exist;
        done();
      });
    });

    it('should resolve with the terms data when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var query =
        client.query()
          .termsQuery({
            fl: 'text',
            prefix: 'te'
          });
      var result = client.terms(query);
      //then
      return expect(result).to.eventually.have.property('terms');
    });
  });

  describe('#mlt', function() {
    it('should get mlt data.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .q({title: 'test'})
          .mltQuery({
            fl: ['title', 'text'],
            mindf: 1,
            mintf: 1
          });
      //when
      client.mlt(query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.response).to.exist;
        expect(result.moreLikeThis).to.exist;
        done();
      });
    });

    it('should resolve with the mlt data when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .q({title: 'test'})
          .mltQuery({
            fl: ['title', 'text'],
            mindf: 1,
            mintf: 1
          });
      //when
      var result = client.mlt(query);
      //then
      return expect(result).to.eventually.have.property('moreLikeThis');
    });
  });

  describe('#spell', function() {
    it('should get spell data.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .df('title')
          .spellcheckQuery({
            q: 'tes',
            build: true,
            collate: true,
            maxCollations: 5,
            maxCollationTries: 3,
            maxCollationEvaluations: 2,
            collateExtendedResults: true,
            collateMaxCollectDocs: 5,
            dictionary: "defaule",
            extendedResults: true,
            onlyMorePopular: true,
            maxResultsForSuggest: 5,
            alternativeTermCount: 3,
            reload: true,
            accuracy: 1.0
          });
      //when
      client.spell(query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.spellcheck).to.exist;
        done();
      });
    });

    it('should resolve with the spell data when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .df('title')
          .spellcheckQuery({
            q: 'tes',
            build: true,
            collate: true,
            maxCollations: 5,
            maxCollationTries: 3,
            maxCollationEvaluations: 2,
            collateExtendedResults: true,
            collateMaxCollectDocs: 5,
            dictionary: "defaule",
            extendedResults: true,
            onlyMorePopular: true,
            maxResultsForSuggest: 5,
            alternativeTermCount: 3,
            reload: true,
            accuracy: 1.0
          });
      //when
      var result = client.spell(query);
      //then
      return expect(result).to.eventually.have.property('spellcheck');
    });
  });

  describe('#suggest', function() {
    it('should get suggest data.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .suggestQuery({
            q: 'tes',
            suggest: true,
            suggesterClass: 'testDictionary',
            maxSuggestions: 3,
            build: true
          });
      //when
      client.suggest(query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.suggest).to.exist;
        done();
      });
    });

    it('should resolve with the suggest data when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      var query =
        client.query()
          .suggestQuery({
            q: 'tes',
            suggest: true,
            suggesterClass: 'testDictionary',
            count: 10,
            build: true
          });
      //when
      var result = client.suggest(query);
      //then
      return expect(result).to.eventually.have.property('suggest');
    });
  });

  describe('#update', function() {
    it('should post data to server without options.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var data = {
        text: 'test',
        title: 'test'
      };
      //when
      client.update(data, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should post data to server with options.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var data = {
        text: 'test',
        title: 'test'
      };
      var options = { commit: true };
      //when
      client.update(data, options, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should resolve with the response when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      var data = {
        text: 'test',
        title: 'test'
      };
      //when
      var result = client.update(data);
      //then
      return expect(result).to.eventually.have.property('responseHeader');
    });
  });

  describe('#delete', function() {
    it('should delete data to server without options.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query = {id:'testid1'};
      //when
      client.delete(query, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should delete data to server with options when query is object.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query = {id:'testid2'};
      var options = { commit: true };
      //when
      client.delete(query, options, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should delete data to server with options when query is string.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query = "id:testid3";
      var options = { commit: true };
      //when
      client.delete(query, options, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should delete data to server with options when query is null.', function(done) {
      //given
      var client = new Client({core: 'test'});
      var query = null;
      var options = { commit: true };
      //when
      client.delete(query, options, function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should resolve with the response when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      var query = {id:'testid1'};
      //when
      var result = client.delete(query);
      //then
      return expect(result).to.eventually.have.property('responseHeader');
    });
  });

  describe('#ping', function() {
    it('should request ping.', function(done) {
      //given
      var client = new Client({core: 'test'});
      //when
      client.ping(function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should resolve with the response when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var result = client.ping();
      //then
      return expect(result).to.eventually.have.property('responseHeader');
    });
  });

  describe('#commit', function() {
    it('should request commit.', function(done) {
      //given
      var client = new Client({core: 'test'});
      //when
      client.commit(function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should resolve with the response when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var result = client.commit();
      //then
      return expect(result).to.eventually.have.property('responseHeader');
    });
  });

  describe('#softCommit', function() {
    it('should request softCommit.', function(done) {
      //given
      var client = new Client({core: 'test'});
      //when
      client.softCommit(function(err, result) {
        //then
        expect(err).to.not.exist;
        expect(result.responseHeader).to.exist;
        done();
      });
    });

    it('should resolve with the response when there is no callback', function() {
      //given
      var client = new Client({core: 'test'});
      //when
      var result = client.softCommit();
      //then
      return expect(result).to.eventually.have.property('responseHeader');
    });
  });

});

