const getTgLink = (endpoint) => {
    const url = `https://api.telegram.org/bot${process.env.TG_TOKEN}/`
    const testUrl = `${url}test/`
    const useTgTestEnv = JSON.parse(process.env.USE_TG_TEST_ENV)
    const link = useTgTestEnv ? `${testUrl}${endpoint}` : `${url}${endpoint}`
    return link
}

module.exports = {getTgLink}
