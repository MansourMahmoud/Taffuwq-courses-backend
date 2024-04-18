module.exports = (res, code, statusText, message, data) => {
    return res.status(code).json({ status: statusText, message, data });
};