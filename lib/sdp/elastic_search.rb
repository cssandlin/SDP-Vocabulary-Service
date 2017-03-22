# rubocop:disable Metrics/ModuleLength
# rubocop:disable Metrics/MethodLength
module SDP
  module Elasticsearch
    def self.with_client
      client = Vocabulary::Elasticsearch.client
      yield client if client.ping
    end

    def self.query_with_type(client, type, query_string, current_user_id)
      client.search index: 'vocabulary', type: type, body: {
        query: {
          bool: {
            filter: { dis_max: { queries: [
              { term: { 'createdBy.id': current_user_id } },
              { match: { status: 'published' } }
            ] } },
            should: [
              { match: { name: { query: query_string, boost: 9 } } },
              { match: { description: { query: query_string, boost: 8 } } },
              { match: { 'codes.code': { query: query_string, boost: 7 } } },
              { match: { 'codes.codeSystem': { query: query_string, boost: 7 } } },
              { match: { 'codes.displayName': { query: query_string, boost: 7 } } },
              { match: { category: { query: query_string } } },
              { match: { 'createdBy.email': { query: query_string } } },
              { match: { 'createdBy.name': { query: query_string } } },
              { match: { status: { query: query_string } } }
            ]
          }
        },
        highlight: {
          pre_tags: ['<strong>'], post_tags: ['</strong>'],
          fields: {
            name: {}, description: {}
          }
        }
      }
    end

    def self.query_without_type(client, query_string, current_user_id)
      client.search index: 'vocabulary', body: {
        query: {
          bool: {
            filter: { dis_max: { queries: [
              { term: { 'createdBy.id': current_user_id } },
              { match: { status: 'published' } }
            ] } },
            should: [
              { match: { name: { query: query_string, boost: 9 } } },
              { match: { description: { query: query_string, boost: 8 } } },
              { match: { 'codes.code': { query: query_string, boost: 7 } } },
              { match: { 'codes.codeSystem': { query: query_string, boost: 7 } } },
              { match: { 'codes.displayName': { query: query_string, boost: 7 } } },
              { match: { category: { query: query_string } } },
              { match: { 'createdBy.email': { query: query_string } } },
              { match: { 'createdBy.name': { query: query_string } } },
              { match: { status: { query: query_string } } }
            ]
          }
        },
        highlight: {
          pre_tags: ['<strong>'], post_tags: ['</strong>'],
          fields: {
            name: {}, description: {}
          }
        }
      }
    end

    def self.search_on_string(client, type, query_string, current_user_id)
      if type
        query_with_type(client, type, query_string, current_user_id)
      elsif query_string
        query_without_type(client, query_string, current_user_id)
      else
        client.search index: 'vocabulary'
      end
    end

    def self.search_on_type(client, type, current_user_id)
      client.search index: 'vocabulary', type: type, body: {
        query: {
          bool: {
            filter: {
              dis_max: {
                queries: [
                  { term: { 'createdBy.id': current_user_id } },
                  { match: { status: 'published' } }
                ]
              }
            }
          }
        }
      }
    end

    def self.search_all(client, current_user_id)
      client.search index: 'vocabulary', body: {
        query: {
          bool: {
            filter: {
              dis_max: {
                queries: [
                  { term: { 'createdBy.id': current_user_id } },
                  { match: { status: 'published' } }
                ]
              }
            }
          }
        }
      }
    end

    def self.ensure_index
      with_client do |client|
        unless client.indices.exists? index: 'vocabulary'
          # create the index
          json = JSON.parse(File.read(File.join(File.dirname(__FILE__), '../../docs/elastic_search_schema.json')))
          client.indices.create index: 'vocabulary',
                                body:  json
        end
      end
    end

    def self.sync
      ensure_index
      with_client do |_client|
        form_ids = Form.ids
        question_ids = Question.ids
        rs_ids = ResponseSet.ids
        delete_all('form', form_ids)
        delete_all('question', question_ids)
        delete_all('response_set', rs_ids)
        Form.all.each do |form|
          UpdateIndexJob.perform_later('form', ESFormSerializer.new(form).as_json)
        end
        Question.all.each do |question|
          UpdateIndexJob.perform_later('question', ESQuestionSerializer.new(question).as_json)
        end
        ResponseSet.all.each do |response_set|
          UpdateIndexJob.perform_later('response_set', ESResponseSetSerializer.new(response_set).as_json)
        end
      end
    end

    def self.delete_all(type, ids)
      with_client do |client|
        client.delete_by_query index: 'vocabulary',
                               type: type,
                               body: { query: { bool: { must_not: { terms: { id: ids } } } } }
      end
    end
  end
end
# rubocop:enable Metrics/ModuleLength
# rubocop:enable Metrics/MethodLength
