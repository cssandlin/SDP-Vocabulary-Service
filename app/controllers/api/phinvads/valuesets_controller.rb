require 'ext/hash'
module Api
  module Phinvads
    class ValuesetsController < ApplicationController
      def index
        valuesets = VADS_SERVICE.getAllValueSets.getValueSets
        # versions = VADS_SERVICE.getAllValueSetVersions.getValueSetVersions
        temp = {}
        valuesets.each do |vs|
          temp[vs.oid] = { valueset: vs, versions: [] }
        end
        # versions.each do |ver|
        #   temp[ver.valueSetOid][:versions] << ver
        # end
        @valuesets = temp.values
      end

      def show
        @valueset = VADS_SERVICE.getValueSetByOid(params[:id]).getValueSet[0]
        versions = VADS_SERVICE.getValueSetVersionsByValueSetOid(@valueset.oid).getValueSetVersions

        if params[:version]
          versions.each { |v| @version = v if v.versionNumber.to_s == params[:version] || v.id == params[:version] }
          raise 'crapppppppppp' unless @version
        else
          @version = versions[0]
        end
        limit = params[:count] ? params[:count].to_i : 1000
        limit = limit > 1000 ? 1000 : limit
        offset = params[:offset] ? params[:offset].to_i : 0
        raise '' if (offset % limit) != 0
        page = (offset / limit) + 1
        @concepts = retrieve_concepts(@version, page, limit).merge(offset: offset)
      end

      private

      def retrieve_concepts(version, page, limit)
        concepts = []
        dto = VADS_SERVICE.getValueSetConceptsByValueSetVersionId(version.id, page, limit)
        concepts.concat dto.getValueSetConcepts
        { concepts: concepts, total: dto.getTotalResults }
      end
    end
  end
end
