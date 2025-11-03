import type { Metadata } from 'next';
import './globals.css';
import WalletWrapper from '../components/WalletWrapper';

export const metadata: Metadata = {
  title: 'MCP 服务器调用工具',
  description: '使用官方 MCP SDK 连接和调用 MCP 服务器',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <WalletWrapper>{children}</WalletWrapper>
      </body>
    </html>
  );
}
