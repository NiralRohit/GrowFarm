
package com.example.smartagri.data.remote

import com.example.smartagri.data.model.*
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface ApiService {
    @POST("crop/recommendation")
    suspend fun getCropRecommendation(@Body req: CropRequest): CropResponse

    @POST("disease/predict")
    suspend fun getDiseasePrediction(@Body req: DiseaseRequest): DiseaseResponse

    @GET("weather")
    suspend fun getWeather(@Query("lat") lat: Double, @Query("lon") lon: Double): WeatherResponse
}
