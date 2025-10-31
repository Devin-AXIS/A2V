'use client';

import { useMemo, useState } from 'react';

export default function X402DemoPage() {
    // 1. HTTP请求URL (存在内存)
    const [httpUrl, setHttpUrl] = useState('');
    
    // 2. 钱包连接状态
    const [walletAddr, setWalletAddr] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    
    // 3. 代币合约地址
    const [contractAddress, setContractAddress] = useState('');
    
    // x402支付相关状态
    const [paymentRequired, setPaymentRequired] = useState<any>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
    const [httpResponse, setHttpResponse] = useState<any>(null);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>('');

    // 模拟x402服务 - 获取需要支付的代币数
    async function simulateX402Request(): Promise<any> {
        // 模拟x402响应，返回支付信息
        return new Promise((resolve) => {
            setTimeout(() => {
                // 模拟需要支付的代币数量（随机生成一个合理的值）
                const amount = Math.random() * 10 + 1; // 1-11之间的随机数
                resolve({
                    status: 402,
                    paymentRequired: {
                        amount: amount.toFixed(4),
                        currency: 'WLT',
                        chainId: chainId || 84532, // Base Sepolia
                        taskId: `task-${Date.now()}`,
                        message: `需要支付 ${amount.toFixed(4)} WLT 代币以访问资源`
                    }
                });
            }, 500);
        });
    }

    // 连接钱包
    async function connectWallet() {
        try {
            const eth = (globalThis as any).ethereum;
            if (!eth) {
                alert('未检测到钱包（MetaMask）。请安装MetaMask后重试。');
                return;
            }
            const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
            const current = accounts?.[0] || null;
            setWalletAddr(current);
            const cidHex: string = await eth.request({ method: 'eth_chainId' });
            setChainId(parseInt(cidHex, 16));
        } catch (e: any) {
            alert(`连接钱包失败: ${e.message}`);
        }
    }

    function disconnectWallet() {
        setWalletAddr(null);
        setChainId(null);
    }

    // 验证地址格式
    function isHexAddress(addr: string) {
        return /^0x[0-9a-fA-F]{40}$/.test(addr);
    }

    // 加载ethers库
    async function loadEthersWithRetry() {
        const max = 3;
        for (let i = 0; i < max; i++) {
            try {
                const mod = await import('ethers');
                return mod;
            } catch (e) {
                console.error('加载 ethers 失败，重试中...', e);
                await new Promise(r => setTimeout(r, 600));
            }
        }
        throw new Error('加载 ethers 失败，请刷新页面后重试');
    }

    // 主流程：发送按钮点击后的完整流程
    async function handleSend() {
        // 验证输入
        if (!httpUrl.trim()) {
            alert('请先输入HTTP请求URL');
            return;
        }
        if (!walletAddr) {
            alert('请先连接钱包');
            return;
        }
        if (!contractAddress.trim()) {
            alert('请先输入代币合约地址');
            return;
        }
        if (!isHexAddress(contractAddress)) {
            alert('无效的合约地址格式');
            return;
        }

        setLoading(true);
        setStatus('开始流程...');
        setPaymentRequired(null);
        setHttpResponse(null);
        setTxHash(null);

        try {
            // 步骤1: 向模拟的x402发送请求，获取需要支付的代币数
            setStatus('步骤1: 向x402服务发送请求...');
            const x402Response = await simulateX402Request();
            
            if (x402Response.status === 402) {
                const paymentInfo = x402Response.paymentRequired;
                setPaymentRequired(paymentInfo);
                setPaymentAmount(parseFloat(paymentInfo.amount));
                setStatus(`需要支付 ${paymentInfo.amount} ${paymentInfo.currency}`);

                // 等待用户确认支付（这里简化为自动处理）
                // 实际应用中，这里应该等待用户完成链上支付并验证
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // 步骤2: 支付完成后，向HTTP URL发送请求
            setStatus('步骤2: 支付完成，向HTTP URL发送请求...');
            const httpResponse = await fetch(httpUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            let httpData: any;
            try {
                httpData = await httpResponse.json();
            } catch {
                const text = await httpResponse.text();
                httpData = { text };
            }
            setHttpResponse({
                status: httpResponse.status,
                data: httpData
            });
            setStatus('步骤2完成：HTTP请求已返回');

            // 步骤3: HTTP请求返回后，与合约交互分发代币
            setStatus('步骤3: 与合约交互，分发代币...');
            
            const { ethers } = await loadEthersWithRetry();
            const eth = (globalThis as any).ethereum;
            const provider = new ethers.BrowserProvider(eth);
            const signer = await provider.getSigner();

            // 准备工作量证明数据
            const taskId = `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const toolName = 'http-request';
            const inputSize = Math.max(1, httpUrl.length);
            const outputSize = JSON.stringify(httpData).length;
            const executionTime = Math.max(1000, Math.min(300000, Date.now() - (Date.now() - 5000))); // 模拟5秒执行时间
            const timestamp = Date.now();

            // 计算proofHash
            const abiCoder = new ethers.AbiCoder();
            const proofHash = ethers.keccak256(
                abiCoder.encode(
                    ['string', 'string', 'uint256', 'uint256', 'uint256', 'uint256'],
                    [taskId, toolName, inputSize, outputSize, executionTime, timestamp]
                )
            );

            // 合约ABI - submitWorkProof函数
            const minimalAbi = [
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
                }
            ];

            // 调用合约
            const contract = new ethers.Contract(contractAddress, minimalAbi, signer);
            const tx = await contract.submitWorkProof(
                taskId,
                toolName,
                inputSize,
                outputSize,
                executionTime,
                timestamp,
                proofHash
            );
            
            setStatus('等待交易确认...');
            const receipt = await tx.wait();
            setTxHash(receipt?.hash || tx?.hash || null);
            setStatus('完成！代币已分发到您的钱包。');
            
        } catch (e: any) {
            console.error('流程执行失败:', e);
            setStatus(`错误: ${e.message}`);
            alert(`流程执行失败: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <h2>X402 协议演示页面</h2>
            
            {/* 1. HTTP请求URL输入 */}
            <section style={{ marginTop: 24 }}>
                <h3>1. HTTP请求URL</h3>
                <label style={{ display: 'block', marginBottom: 8 }}>
                    输入HTTP请求URL（将存储在内存中）
                </label>
                <input
                    style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8 }}
                    placeholder="https://api.example.com/data"
                    value={httpUrl}
                    onChange={e => setHttpUrl(e.target.value)}
                />
                <small style={{ color: '#666' }}>
                    当前存储的URL: {httpUrl || '(未设置)'}
                </small>
            </section>

            {/* 2. 钱包连接 */}
            <section style={{ marginTop: 24 }}>
                <h3>2. 连接钱包</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    {!walletAddr ? (
                        <button onClick={connectWallet}>连接 MetaMask</button>
                    ) : (
                        <>
                            <span>地址: {walletAddr}</span>
                            <span>链ID: {chainId ?? '-'}</span>
                            <button onClick={disconnectWallet}>断开</button>
                        </>
                    )}
                </div>
            </section>

            {/* 3. 代币合约地址 */}
            <section style={{ marginTop: 24 }}>
                <h3>3. 代币合约地址</h3>
                <label style={{ display: 'block', marginBottom: 8 }}>
                    输入代币合约地址
                </label>
                <input
                    style={{ display: 'block', width: '100%', padding: 8, marginBottom: 8 }}
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={e => setContractAddress(e.target.value)}
                />
            </section>

            {/* 4. x402支付信息显示 */}
            <section style={{ marginTop: 24 }}>
                <h3>4. X402支付信息</h3>
                {paymentRequired ? (
                    <div style={{ 
                        marginTop: 12, 
                        padding: 16, 
                        background: '#f5f5f5', 
                        borderRadius: 8,
                        border: '1px solid #ddd'
                    }}>
                        <div><strong>需要支付的金额:</strong> {paymentRequired.amount} {paymentRequired.currency}</div>
                        <div><strong>链ID:</strong> {paymentRequired.chainId}</div>
                        <div><strong>任务ID:</strong> {paymentRequired.taskId}</div>
                        <div><strong>消息:</strong> {paymentRequired.message}</div>
                    </div>
                ) : (
                    <div style={{ color: '#999', marginTop: 12 }}>
                        尚未获取支付信息，请点击发送按钮
                    </div>
                )}
            </section>

            {/* 5. 发送按钮和状态 */}
            <section style={{ marginTop: 24 }}>
                <h3>5. 执行流程</h3>
                <button
                    onClick={handleSend}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        fontSize: 16,
                        background: loading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        marginTop: 12
                    }}
                >
                    {loading ? '执行中...' : '发送请求'}
                </button>

                {status && (
                    <div style={{ 
                        marginTop: 12, 
                        padding: 12, 
                        background: '#e3f2fd', 
                        borderRadius: 4 
                    }}>
                        <strong>状态:</strong> {status}
                    </div>
                )}

                {httpResponse && (
                    <div style={{ marginTop: 16 }}>
                        <h4>HTTP响应结果:</h4>
                        <pre style={{ 
                            background: '#fafafa', 
                            padding: 12, 
                            borderRadius: 4,
                            overflow: 'auto',
                            maxHeight: 300
                        }}>
                            {JSON.stringify(httpResponse, null, 2)}
                        </pre>
                    </div>
                )}

                {txHash && (
                    <div style={{ marginTop: 16 }}>
                        <h4>合约交易信息:</h4>
                        <div style={{ 
                            padding: 12, 
                            background: '#e8f5e9', 
                            borderRadius: 4 
                        }}>
                            <strong>交易哈希:</strong> {txHash}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

