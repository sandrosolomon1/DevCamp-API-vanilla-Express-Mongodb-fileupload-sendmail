const logger = (req,res,next) => {
    req.hello = 'hello world!';
    console.log(req.method,req.protocol);
    next();
}

module.exports = logger;