declare module 'solr-node' {
  class Client {
    constructor(options: Client.ClientOptions);

    query(): Client.Query;

    search<R extends object>(query: Client.Query | string): Promise<Client.SolrResponse<R>>;
    terms<R extends object>(query: Client.Query | string): Promise<Client.SolrResponse<R>>;
    mlt<R extends object>(query: Client.Query | string): Promise<Client.SolrResponse<R>>;
    spell<R extends object>(query: Client.Query | string): Promise<Client.SolrResponse<R>>;
    update<R extends object>(data: object, options?: Client.UpdateOptions): Promise<Client.SolrResponse<R>>;
    delete<R extends object>(query?: Client.Query | string, options?: Client.UpdateOptions): Promise<Client.SolrResponse<R>>;
    ping<R extends object>(): Promise<Client.SolrResponse<R>>;
    commit<R extends object>(): Promise<Client.SolrResponse<R>>;
    softCommit<R extends object>(): Promise<Client.SolrResponse<R>>;
  }

  namespace Client {
    export class Query {
      dismax(): this;
      edismax(): this;
      q(params: object | string): this;
      qop(params: string): this;
      fl(params: string): this;
      start(params: string | number): this;
      rows(params: string | number): this;
      sort(params: object): this;
      fq(params: string): this;
      df(params: string): this;
      wt(params: string): this;
      addParams(params: Array<{ field: string; value: any }>): this;
      spatial(params: { pt: string; sfield: string; d: string | number }): this;
      termsQuery(params: TermsQueryParams | string): this;
      mltQuery(params: MoreLikeThisQueryParams | string): this;
      spellcheckQuery(params: SpellcheckQueryParams | string): this;
      suggestQuery(params: SuggestQueryParams | string): this;
      facetQuery(params: FacetQueryParams | string): this;
      groupQuery(params: GroupQueryParams | string): this;
      hlQuery(params: HighlightQueryParams | string): this;

      toString(): string;
    }

    export interface SolrResponse<T> {
      responseHeader: {
        status: number;
        QTime: number;
        params: object;
      };
      response: {
        numFound: number;
        start: number;
        docs: T[];
      };
      nextCursorMark?: string;
    }

    interface ClientOptions {
      host?: string;
      port?: number | string;
      core?: string;
      rootPath?: string;
      protocol?: string;
    }

    interface UpdateOptions {
      commit?: boolean;
    }

    interface TermsQueryParams {
      on?: boolean;
      fl: string;
      lower?: string;
      lowerIncl?: boolean;
      mincount?: number;
      maxcount?: number;
      prefix?: string;
      regex?: string;
      regexFlag?: string;
      limit?: number;
      upper?: string;
      upperIncl?: boolean;
      raw?: boolean;
      sort?: string;
    }

    interface MoreLikeThisQueryParams {
      on?: boolean;
      fl: string | string[];
      mintf?: string;
      mindf?: string;
      maxdf?: string;
      minwl?: string;
      maxwl?: string;
      maxqt?: string;
      maxntp?: string;
      boost?: boolean;
      qf?: string;
      count?: number;
      matchInclude?: boolean;
      matchOffset?: number;
      interestingTerms?: string;
    }

    interface SpellcheckQueryParams {
      on?: boolean;
      q: string;
      build?: boolean;
      collate?: boolean;
      maxCollations?: number;
      maxCollationTries?: number;
      maxCollationEvaluations?: number;
      collateExtendedResults?: boolean;
      collateMaxCollectDocs?: number;
      count?: number;
      dictionary?: string;
      extendedResults?: boolean;
      onlyMorePopular?: boolean;
      maxResultsForSuggest?: number;
      alternativeTermCount?: number;
      reload?: boolean;
      accuracy?: number;
    }

    interface SuggestParams {
      on?: boolean;
      q: string;
      build?: boolean;
      count?: number;
      suggesterClass?: string;
    }

    interface FacetQueryParams {
      on?: boolean;
      query: string;
      field: string | string[];
      prefix?: string;
      contains?: string;
      containsIgnoreCase?: string;
      sort?: string;
      limit?: number;
      offset?: number;
      mincount?: number;
      missing?: boolean;
      method?: 'enum' | 'fc' | 'fcs';
    }

    interface GroupQueryParams {
      on?: boolean;
      field: string;
      query: string;
      limit?: number;
      offset?: number;
      sort?: string;
      format?: string;
      main?: boolean;
      ngroups?: boolean;
      truncate?: boolean;
      facet?: boolean;
      cachePercent?: number;
    }

    interface HighlightQueryParams {
      on?: boolean;
      q?: string;
      method?: string;
      qparser?: string;
      fl: string | string[];
      snippets?: number;
      fragsize?: number;
      mergeContiguous?: boolean;
      requireFieldMatch?: boolean;
      maxAnalyzedChars?: number;
      maxMultiValuedToExamine?: number;
      maxMultiValuedToMatch?: number;
      alternateField?: string;
      maxAlternateFieldLength?: number;
      formatter?: string;
      simplePre?: string;
      simplePost?: string;
      fragmenter?: string;
      usePhraseHighlighter?: boolean;
      highlightMultiTerm?: boolean;
      regexSlop?: number;
      regexPattern?: string;
      regexMaxAnalyzedChars?: number;
      preserveMulti?: boolean;
    }
  }

  export = Client;
}
