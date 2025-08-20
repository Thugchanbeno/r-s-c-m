import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import DataExportService from '@/services/dataExportService';
import connectDB from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { projectId } = req.query;
    const { top_k = 10, retrain = false } = req.query;

    // Export current data from MongoDB
    const exportService = new DataExportService();
    const exportPaths = await exportService.exportAllData();
    
    // Validate data sufficiency
    const validation = await exportService.validateAndAugmentData();
    
    if (validation.recommendations.length > 0) {
      console.warn('Data validation warnings:', validation.recommendations);
    }

    // Run Python recommendation script
    const recommendations = await runPythonRecommendation({
      projectId,
      exportPaths,
      topK: parseInt(top_k),
      retrain: retrain === 'true'
    });

    res.status(200).json({
      success: true,
      projectId,
      recommendations,
      dataStats: validation.stats,
      warnings: validation.recommendations
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

async function runPythonRecommendation({ projectId, exportPaths, topK, retrain }) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(process.cwd(), 'python', 'recommendation_runner.py');
    
    const args = [
      pythonScript,
      '--project-id', projectId,
      '--users-path', exportPaths.users,
      '--skills-path', exportPaths.skills,
      '--projects-path', exportPaths.projects,
      '--user-skills-path', exportPaths.userSkills,
      '--allocations-path', exportPaths.allocations,
      '--top-k', topK.toString(),
      '--retrain', retrain.toString()
    ];

    const pythonProcess = spawn('python', args);
    
    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process failed: ${error}`));
      } else {
        try {
          const recommendations = JSON.parse(result);
          resolve(recommendations);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${parseError.message}`));
        }
      }
    });

    // Set timeout
    setTimeout(() => {
      pythonProcess.kill();
      reject(new Error('Recommendation process timeout'));
    }, 60000); 
  });
}
