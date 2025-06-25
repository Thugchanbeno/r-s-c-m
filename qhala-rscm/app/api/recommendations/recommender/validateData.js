export async function validateDataEndpoint(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const exportService = new DataExportService();
    const validation = await exportService.validateAndAugmentData();
    
    res.status(200).json({
      success: true,
      ...validation
    });

  } catch (error) {
    console.error('Data validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}