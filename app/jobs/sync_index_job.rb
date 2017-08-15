require 'sdp/elastic_search'
class SyncIndexJob < ApplicationJob
  queue_as :default
  def perform
    SDP::Elasticsearch.sync_now
  end
end
