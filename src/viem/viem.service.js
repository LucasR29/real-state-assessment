const { createPublicClient, http } = require("viem");
const { mainnet } = require("viem/chains");

class ViemService {
    constructor() {
        this.client = createPublicClient({
            chain: mainnet,
            transport: http(process.env.RPC_URL)
        });
    }

    getClient() {
        return this.client;
    }

    async callContract(address, abi, functionName, args = []) {
        return await this.client.readContract({
            address: address,
            abi: abi,
            functionName: functionName,
            args: args,
        });
    }
}

module.exports = { ViemService };