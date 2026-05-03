
package com.example.smartagri.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.smartagri.data.model.CropRequest
import com.example.smartagri.viewmodel.CropViewModel
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun CropRecommendationScreen(navController: NavController, vm: CropViewModel = viewModel()) {
    var n by remember { mutableStateOf("") }
    var p by remember { mutableStateOf("") }
    var k by remember { mutableStateOf("") }
    var temp by remember { mutableStateOf("") }
    var humidity by remember { mutableStateOf("") }
    var ph by remember { mutableStateOf("") }
    var rainfall by remember { mutableStateOf("") }

    val result by vm.crop.collectAsState()

    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("Enter Soil & Weather Data", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(n, { n = it }, label = { Text("Nitrogen (N)") })
        OutlinedTextField(p, { p = it }, label = { Text("Phosphorus (P)") })
        OutlinedTextField(k, { k = it }, label = { Text("Potassium (K)") })
        OutlinedTextField(temp, { temp = it }, label = { Text("Temperature (°C)") })
        OutlinedTextField(humidity, { humidity = it }, label = { Text("Humidity (%)") })
        OutlinedTextField(ph, { ph = it }, label = { Text("pH") })
        OutlinedTextField(rainfall, { rainfall = it }, label = { Text("Rainfall (mm)") })
        Spacer(Modifier.height(16.dp))
        Button(onClick = {
            val req = CropRequest(
                n.toInt(), p.toInt(), k.toInt(),
                temp.toFloat(), humidity.toFloat(),
                ph.toFloat(), rainfall.toFloat()
            )
            vm.fetchRecommendation(req)
        }) {
            Text("Recommend")
        }
        Spacer(Modifier.height(24.dp))
        result?.let {
            Text("Recommended Crop: $it", style = MaterialTheme.typography.titleMedium)
        }
    }
}
