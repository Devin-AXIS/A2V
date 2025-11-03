'use client';

import { useWallet } from '../contexts/WalletContext';

export default function WalletButton() {
    const { address, isConnected, isConnecting, connect, disconnect } = useWallet();

    const formatAddress = (addr: string | null) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            alert('地址已复制到剪贴板！');
        }
    };

    return (
        <div className="wallet-button-container">
            {isConnected && address ? (
                <div className="wallet-connected">
                    <span className="wallet-address" onClick={copyAddress} title="点击复制地址">
                        {formatAddress(address)}
                    </span>
                    <button className="btn btn-secondary btn-disconnect" onClick={disconnect}>
                        断开连接
                    </button>
                </div>
            ) : (
                <button
                    className="btn btn-primary btn-connect"
                    onClick={connect}
                    disabled={isConnecting}
                >
                    {isConnecting ? '连接中...' : '连接 MetaMask'}
                </button>
            )}
        </div>
    );
}

