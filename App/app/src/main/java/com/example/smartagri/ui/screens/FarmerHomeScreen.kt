
package com.example.smartagri.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun FarmerHomeScreen(navController: NavController) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("Welcome, Farmer!", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(32.dp))
        Button(onClick = { navController.navigate("crop") }, modifier = Modifier.fillMaxWidth()) {
            Text("Crop Recommendation")
        }
        Spacer(Modifier.height(16.dp))
        Button(onClick = { navController.navigate("disease") }, modifier = Modifier.fillMaxWidth()) {
            Text("Disease Detection")
        }
        Spacer(Modifier.height(16.dp))
        Button(onClick = { navController.navigate("weather") }, modifier = Modifier.fillMaxWidth()) {
            Text("Weather Analyzer")
        }
    }
}
