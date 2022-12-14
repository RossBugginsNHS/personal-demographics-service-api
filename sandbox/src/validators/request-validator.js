const { isUUID } = require("validator");

module.exports = {
    
    validateIfMatchParameter: function (request) {
        return request.headers["if-match"] && (request.headers["if-match"].startsWith('W/"') && request.headers["if-match"].endsWith('"'))
    },

    validateIfMatchHeaderIsCorrectVersion: function(request, examplePatient) {
        return request.headers["if-match"].slice(3, -1) == examplePatient.meta.versionId
    },

    validateContentTypeHeader: function (request) {
        // Allowing application/json-patch+json and application/json because of an issue with apigee and application/json-patch+json
        return request.headers["content-type"] && (
            request.headers["content-type"].toLowerCase() === "application/json-patch+json" ||
            request.headers["content-type"].toLowerCase() === "application/json"
        )
    },

    verifyPatchObjectHasBeenSubmitted: function(request) {
        return request.payload && request.payload.patches && request.payload.patches.length !== 0
    },

    validateRequestIdHeader: ({ headers: { "x-request-id": xRequestId }}) => !!xRequestId && isUUID(xRequestId, 4),

    verifyAddressIdNotPresentWhenRequired: function(request, patientToUpdate) {
        var idRequired = false
        var idPresent = false
        var validId = false
        var objectId = []
        var addressId = []
        var addressPresent = false

        if (patientToUpdate.meta.security[0].display == "restricted") return

        if (patientToUpdate.address != undefined) {
            addressPresent = true
            for (let i of patientToUpdate.address) {
                objectId.push(i.id)
            }}

        for (let i of Object.keys(request.payload.patches)) {
            let path = request.payload.patches[i].path
            let pathValue = path.split("/")[1]
     
            if (path.includes("/address/")) {
                idRequired = true
            } 
            if (path.split("/").pop() == "id") {
                addressId = request.payload.patches[i].value
            }
            if (idRequired && path.includes("/id") && objectId.includes(addressId)) {
                idPresent = true
                validId = true
            } else if (idRequired && path.includes("/id") && !objectId.includes(addressId)) {
                idPresent = true
                validId = false
                var wrongId = addressId
        }
        
        if (idRequired && !idPresent) {
            return {0: pathValue} 
        } else if (idRequired && idPresent && addressPresent && validId != true) {
            return {1: pathValue, 2: wrongId}
        } else if (idRequired && idPresent && !addressPresent) {
            return {3: ""}
        }}
    }
}
