const express = require('express');
const router = express.Router();
const { ViemService } = require('../viem/viem.service');
const erc20Abi = require('../contract/erc20.abi.json');

router.get('/ApiTest', async (req, res) => {
    try {
        const viem = new ViemService();
        
        const usdcAddress = process.env.USDC_ADDRESS;

        const [totalSupply, name, symbol, decimals] = await Promise.all([
            viem.callContract(usdcAddress, erc20Abi, 'totalSupply', []),
            viem.callContract(usdcAddress, erc20Abi, 'name', []),
            viem.callContract(usdcAddress, erc20Abi, 'symbol', []),
            viem.callContract(usdcAddress, erc20Abi, 'decimals', [])
        ]);

        const totalSupplyFormatted = (Number(totalSupply) / Math.pow(10, Number(decimals))).toFixed(2);

        res.json({
            success: true,
            data: {
                totalSupply: totalSupply.toString(),
                totalSupplyFormatted: totalSupplyFormatted,
                symbol: symbol,
                name: name,
                decimals: Number(decimals),
                contractAddress: usdcAddress
            }
        });
    } catch (error) {
        console.error('Error fetching USDC data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch USDC contract data',
            details: error.message
        });
    }
});

module.exports = router;