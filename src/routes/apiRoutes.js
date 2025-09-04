const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/databases', apiController.listDatabases);
router.get('/collections/:dbName', apiController.listCollections);
router.get('/collection-stats/:dbName/:collectionName', apiController.getCollectionStats);
router.post('/copy-selected-collections', apiController.copySelectedCollections);

module.exports = router;
