
package com.example.smartagri.data.model

data class CropRequest(
    val N: Int,
    val P: Int,
    val K: Int,
    val temperature: Float,
    val humidity: Float,
    val ph: Float,
    val rainfall: Float
)

data class CropResponse(
    val recommendedCrop: String
)
