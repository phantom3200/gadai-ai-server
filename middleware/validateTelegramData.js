const crypto = require('crypto');

const validateInitTgData = (req, res, next) => {
    const { body: { initData, tgId  } } = req

    if (!initData || !tgId) {
        res.status(403).json({success:false, message: `Telegram data is not provided`});
        return;
    }

    const urlSearchParams = new URLSearchParams(initData);
    const data = Object.fromEntries(urlSearchParams.entries());
    const checkString = Object.keys(data).filter(key => key !== 'hash' )
        .map(key =>
            `${key}=${data[key]}`)
        .sort()
        .join('\n');
    const secretkey = crypto.createHmac( 'sha256', 'WebAppData')
        .update(process.env.TG_TOKEN)
        .digest();
    const signature = crypto.createHmac('sha256', secretkey)
        .update(checkString)
        .digest( 'hex');

    if (data.hash !== signature) {
        res.status(403).json({success:false, message: `Telegram data is invalid`});
        return;
    }
    next();
};

module.exports = validateInitTgData;
