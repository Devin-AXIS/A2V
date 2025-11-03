'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // 检查是否已连接
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts && accounts.length > 0) {
                        setAddress(accounts[0]);
                    }
                } catch (error) {
                    console.error('检查钱包连接失败:', error);
                }
            }
        };

        checkConnection();

        // 监听账户变化
        if (typeof window !== 'undefined' && window.ethereum) {
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts && accounts.length > 0) {
                    setAddress(accounts[0]);
                } else {
                    setAddress(null);
                }
            };

            const handleChainChanged = () => {
                // 链变化时，重新获取账户
                checkConnection();
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);

    const connect = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            alert('请先安装 MetaMask 钱包扩展！');
            return;
        }

        setIsConnecting(true);
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            if (accounts && accounts.length > 0) {
                setAddress(accounts[0]);
            }
        } catch (error: any) {
            console.error('连接钱包失败:', error);
            if (error.code === 4001) {
                alert('用户拒绝了连接请求');
            } else {
                alert('连接钱包失败: ' + error.message);
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnect = () => {
        setAddress(null);
    };

    return (
        <WalletContext.Provider
            value={{
                address,
                isConnected: !!address,
                isConnecting,
                connect,
                disconnect,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet 必须在 WalletProvider 内使用');
    }
    return context;
}

// 扩展 Window 接口以支持 ethereum
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: any[] }) => Promise<any>;
            on: (event: string, callback: (...args: any[]) => void) => void;
            removeListener: (event: string, callback: (...args: any[]) => void) => void;
            isMetaMask?: boolean;
        };
    }
}

