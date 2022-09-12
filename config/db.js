if (process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: (PORT) => {
            return `mongodb://localhost:${PORT}/blogapp`
        }
    }
} else {
    module.exports = {
        mongoURI: (PORT) => {
            return `mongodb://localhost:${PORT}/blogapp`
        }
    }
}