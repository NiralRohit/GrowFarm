
package com.example.smartagri.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun DiseaseDetectionScreen(navController: NavController) {
    Column(Modifier.fillMaxSize().padding(24.dp)) {
        Text("Upload plant leaf photo (feature coming soon)", style = MaterialTheme.typography.bodyLarge)
    }
}
