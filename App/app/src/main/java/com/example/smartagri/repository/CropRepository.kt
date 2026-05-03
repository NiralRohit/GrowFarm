
package com.example.smartagri.repository

import com.example.smartagri.data.model.CropRequest
import com.example.smartagri.data.model.CropResponse
import com.example.smartagri.data.remote.NetworkModule

class CropRepository {
    private val api = NetworkModule.apiService
    suspend fun recommendCrop(req: CropRequest): CropResponse = api.getCropRecommendation(req)
}
