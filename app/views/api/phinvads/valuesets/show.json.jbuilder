
# json.(@valueset, :id,:oid,:name,:code,:status,
#                    :statusDate,:definitionText,:scopeNoteText,
#                    :assigningAuthorityId,:valueSetCreatedDate,
#                    :valueSetLastRevisionDate)
#
# json.version(@version,:id,:valueSetOid,:versionNumber,:description,
# :status,:statusDate,:assigningAuthorityText,:assigningAuthorityReleaseDate,:noteText,
# :effectiveDate,:expiryDate
# )
#
# json.expansion do
#   json.identifier nil
#   json.timestamp = nil
#   json.contains do
#     json.array! @concepts do |code|
#       json.system code.codeSystemOid
#       json.code code.conceptCode
#       json.display code.codeSystemConceptName
#       json.description code.definitionText
#       json.valueSetVersionId code.valueSetVersionId
#       json.vads(code, :id,:codeSystemOid ,:valueSetVersionId,:conceptCode,:scopeNoteText,:status,
#       :statusDate,:cdcPreferredDesignation,:preferredAlternateCode,:definitionText,:codeSystemConceptName)
#
#     end
#   end
# end
json.resourceType  'ValueSet'
json.id @valueset.id
json.url	json.url api_phinvads_valueset_url(@valueset.oid.strip)
json.identifier	do
  json.system "urn:ietf:rfc:3986"
  json.value 'urn:oid:' + @valueset.oid
end
json.version	@version.versionNumber
json.name	force_json_encoding(@valueset.name)
json.status	@valueset.status
json.date	@valueset.valueSetLastRevisionDate
json.publisher 'PHIN VADS'
json.description	force_json_encoding(@valueset.definitionText)
json.expansion do
  json.identifier nil
  json.timestamp  nil
  json.total @concepts[:total]
  json.offset @concepts[:offset]
  json.contains do
    json.array! @concepts[:concepts] do |code|
      json.system force_json_encoding(code.codeSystemOid)
      json.code force_json_encoding(code.conceptCode)
      json.display force_json_encoding(code.codeSystemConceptName)
    end
  end
end
