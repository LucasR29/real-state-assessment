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
        const result = await this.client.readContract({
            address: address,
            abi: abi,
            functionName: functionName,
            args: args,
        });
        process.stdout.write(`${functionName}: ${result}\n`);
        return result;
    }
}

module.exports = { ViemService };