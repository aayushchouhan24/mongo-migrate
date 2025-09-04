const DatabaseOperations = require('../services/databaseOperations');

exports.listDatabases = async (req, res) => {
  try {
    const { uri } = req.query;
    if (!uri) return res.status(400).json({ success: false, message: 'uri is required' });
    const databases = await DatabaseOperations.listDatabases(uri);
    res.json({ success: true, databases });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.listCollections = async (req, res) => {
  try {
    const { uri } = req.query;
    const { dbName } = req.params;
    if (!uri) return res.status(400).json({ success: false, message: 'uri is required' });
    const collections = await DatabaseOperations.listCollections(uri, dbName);
    res.json({ success: true, collections });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getCollectionStats = async (req, res) => {
  try {
    const { uri } = req.query;
    const { dbName, collectionName } = req.params;
    if (!uri) return res.status(400).json({ success: false, message: 'uri is required' });
    const stats = await DatabaseOperations.getCollectionStats(uri, dbName, collectionName);
    res.json({ success: true, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.copySelectedCollections = async (req, res) => {
  try {
    const { sourceUri, targetUri, sourceDbName, targetDbName, selectedCollections, clearTarget } = req.body;
    if (!sourceUri || !targetUri || !sourceDbName || !targetDbName || !selectedCollections || selectedCollections.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const result = await DatabaseOperations.copySelectedCollections(sourceUri, targetUri, sourceDbName, targetDbName, selectedCollections, clearTarget);
    res.json({ success: true, result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
