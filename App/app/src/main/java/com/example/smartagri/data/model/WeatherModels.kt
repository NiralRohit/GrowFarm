
package com.example.smartagri.data.model

data class WeatherResponse(
    val city: String,
    val temperature: Float,
    val humidity: Int,
    val description: String
)
