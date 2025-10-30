import { ethers } from 'ethers';

export type SubmitWorkProofParams = {
  taskId: string;
  toolName: string;
  inputSize: bigint | number;
  outputSize: bigint | number;
  executionTime: bigint | number; // ms
  timestamp: bigint | number; // ms
  proofHash: string; // 0x...
};

const ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'taskId', type: 'string' },
      { internalType: 'string', name: 'toolName', type: 'string' },
      { internalType: 'uint256', name: 'inputSize', type: 'uint256' },
      { internalType: 'uint256', name: 'outputSize', type: 'uint256' },
      { internalType: 'uint256', name: 'executionTime', type: 'uint256' },
      { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
      { internalType: 'bytes32', name: 'proofHash', type: 'bytes32' }
    ],
    name: 'submitWorkProof',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserWorkload',
    outputs: [
      { internalType: 'uint256', name: 'totalTasks', type: 'uint256' },
      { internalType: 'uint256', name: 'totalTokensEarned', type: 'uint256' },
      { internalType: 'uint256', name: 'lastActivity', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

export class WorkloadContractClient {
  private readonly contract: ethers.Contract;
  private readonly signer: ethers.Signer;

  constructor(options: { rpcUrl: string; privateKey: string; contractAddress: string }) {
    const provider = new ethers.JsonRpcProvider(options.rpcUrl);
    this.signer = new ethers.Wallet(options.privateKey, provider);
    this.contract = new ethers.Contract(options.contractAddress, ABI, this.signer);
  }

  async submitWorkProof(params: SubmitWorkProofParams) {
    const tx = await this.contract.submitWorkProof(
      params.taskId,
      params.toolName,
      params.inputSize,
      params.outputSize,
      params.executionTime,
      params.timestamp,
      params.proofHash
    );
    return await tx.wait();
  }

  async getUserWorkload(address: string) {
    const result = await this.contract.getUserWorkload(address);
    return {
      totalTasks: BigInt(result.totalTasks).toString(),
      totalTokensEarned: BigInt(result.totalTokensEarned).toString(),
      lastActivity: BigInt(result.lastActivity).toString()
    };
  }
}
