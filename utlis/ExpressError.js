class ExpressError extends Error {
  constructor(message, statusCode) {
    super();                     // ① call the built-in Error constructor
    this.message = message;      // ② set your custom error message
    this.statusCode = statusCode;// ③ set your custom HTTP status code
  }
}
module.exports = ExpressError;