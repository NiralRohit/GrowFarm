
package com.example.smartagri.data.model

data class DiseaseRequest(
    val imageBase64: String
)

data class DiseaseResponse(
    val disease: String,
    val confidence: Float
)
