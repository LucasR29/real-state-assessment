const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const killPort = require('kill-port');
const path = require('path');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const { initRuntimeConfig } = require('./config/runtimeConfig');
const viemRouter = require('./routes/viem');

require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3001;

// Middleware
app.use(cors({ origin: `http://localhost:${PORT}` }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/viem', viemRouter);

/**
 * @route    GET /api/ApiTest
 * @desc     Fetches data from USDC smart contract on Ethereum mainnet
 * @author   Lucas
 * @access   public
 * @param    {Request}  req  - Express request object
 * @param    {Response} res  - Express response object
 * @returns  {JSON}          Contract data including total supply, symbol, name, and decimals
 * @throws   {Error}         500 on contract interaction failure
 *
 * @example
 * // Example request
 * curl -X GET http://localhost:3001/api/ApiTest
 *
 * // Example response
 * {
 *   "success": true,
 *   "data": {
 *     "totalSupply": "1000000000000000",
 *     "totalSupplyFormatted": "1000000.0",
 *     "symbol": "USDC",
 *     "name": "USD Coin",
 *     "decimals": 6,
 *     "contractAddress": "0xA0b86a33E6441b8c4C8C0e4b8b8c4C8C0e4b8b8c4"
 *   }
 * }
 */

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const startServer = async (port) => {
    await initRuntimeConfig();
    const server = app.listen(port, () => {
        console.log(`Backend running on http://localhost:${port}`);
    });

    const shutdownHandler = (signal) => {
        console.log(`\nCaught ${signal}. Shutting down gracefully...`);
        server.close(() => {
            console.log('Server closed. Port released.');
            process.exit(0);
        });

        setTimeout(() => {
            console.error('Force exiting after timeout');
            process.exit(1);
        }, 5000);
    };

    process.on('SIGINT', () => shutdownHandler('SIGINT'));
    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        shutdownHandler('uncaughtException');
    });
};

const safeStart = (port) => {
    // Kill port BEFORE starting server
    killPort(port, 'tcp')
        .then(() => {
            console.log(`Port ${port} free. Starting fresh server...`);
            startServer(port);
        })
        .catch((err) => {
            console.log(`Port ${port} use. restart server...`);
            safeStart(port + 1);
        });
}

safeStart(PORT);