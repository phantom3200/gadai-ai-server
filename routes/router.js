const Router = require('express')
const router = new Router()
const tgController = require('../controllers/tg.controller')
const firebaseController = require('../controllers/firebase.controller')
const aiController = require('../controllers/ai.controller')
const authenticateToken = require('../middleware/authenticateToken');

router.post('/auth', firebaseController.firebaseAuth);
router.post('/getInvoiceLink', authenticateToken, tgController.getInvoiceLink);
router.get('/getUserData', authenticateToken, firebaseController.getUserData);
router.post('/createUser', authenticateToken, firebaseController.createUser);
router.post('/updateUser', authenticateToken, firebaseController.updateUser);
router.post('/getPrediction', authenticateToken, aiController.getPrediction);


module.exports = router
