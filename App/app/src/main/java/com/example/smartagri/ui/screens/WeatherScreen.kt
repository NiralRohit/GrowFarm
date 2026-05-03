
package com.example.smartagri.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun WeatherScreen(navController: NavController) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("Weather details (integration TODO)", style = MaterialTheme.typography.bodyLarge)
    }
}
