
package com.example.smartagri.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.smartagri.data.model.CropRequest
import com.example.smartagri.repository.CropRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CropViewModel: ViewModel() {
    private val repo = CropRepository()

    private val _crop = MutableStateFlow<String?>(null)
    val crop: StateFlow<String?> = _crop

    fun fetchRecommendation(req: CropRequest) {
        viewModelScope.launch {
            val res = repo.recommendCrop(req)
            _crop.value = res.recommendedCrop
        }
    }
}
