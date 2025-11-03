'use client';

import { WalletProvider } from '../contexts/WalletContext';
import WalletButton from './WalletButton';

export default function WalletWrapper({ children }: { children: React.ReactNode }) {
    return (
        <WalletProvider>
            <div className="wallet-header">
                <WalletButton />
            </div>
            {children}
        </WalletProvider>
    );
}

