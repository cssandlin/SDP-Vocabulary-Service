
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
json.resourceType:ValueSet
json.id @valueset.id
json.url	json.url api_phinvads_valueset_url(@valueset.oid.strip)
json.identifier	do
  json.system 'urn:ietf:rfc:3986'
  json.value 'urn:oid:' + @valueset.oid.force_encoding('ISO-8859-1').encode('UTF-8')
end
json.version	@version.versionNumber
json.name	@valueset.name.force_encoding('ISO-8859-1').encode('UTF-8')
json.status	@valueset.status.force_encoding('ISO-8859-1').encode('UTF-8')
json.date	@valueset.valueSetLastRevisionDate
json.publisher 'PHIN VADS'
json.description	@valueset.definitionText.force_encoding('ISO-8859-1').encode('UTF-8')
json.expansion do
  json.identifier nil
  json.timestamp  nil
  json.total @concepts[:total]
  json.offset @concepts[:offset]
  json.contains do
    json.array! @concepts[:concepts] do |code|
      json.system code.codeSystemOid.force_encoding('ISO-8859-1').encode('UTF-8')
      json.code code.conceptCode.force_encoding('ISO-8859-1').encode('UTF-8')
      json.display code.codeSystemConceptName.force_encoding('ISO-8859-1').encode('UTF-8')
    end
  end
end
