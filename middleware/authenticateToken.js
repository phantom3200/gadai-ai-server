const admin = require('firebase-admin');

// Middleware для проверки токена
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const idToken = authHeader && authHeader.split('Bearer ')[1];

    if (!idToken) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        // Проверяем валидность токена
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Сохраняем декодированный токен в req (например, uid, tgId и др.)
        next(); // Переходим к следующему обработчику
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

module.exports = authenticateToken;
