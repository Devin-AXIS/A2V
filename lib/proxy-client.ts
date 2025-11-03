// 代理客户端辅助函数
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { promises as fs } from 'fs';
import path from 'path';

const CONFIGS_FILE = path.join(process.cwd(), 'data', 'mcp-configs', 'configs.json');

// 存储活跃的代理会话
interface ProxySession {
  configId: string;
  mcpClient: Client;
  transport: any;
  eventSource?: any;
  messageQueue: any[];
  controller: ReadableStreamDefaultController<Uint8Array>;
}

declare global {
  // eslint-disable-next-line no-var
  var __mcpProxySessions: Map<string, ProxySession> | undefined;
}

function getProxySessions(): Map<string, ProxySession> {
  if (!globalThis.__mcpProxySessions) {
    globalThis.__mcpProxySessions = new Map<string, ProxySession>();
  }
  return globalThis.__mcpProxySessions;
}

/**
 * 从代理连接ID中获取MCP客户端
 * @param connectionId - 连接ID（格式：proxy_[configId]）
 * @returns MCP客户端实例
 */
export function getProxyClient(connectionId: string): Client {
  if (!connectionId.startsWith('proxy_')) {
    throw new Error(`不是代理连接ID: ${connectionId}`);
  }

  const configId = connectionId.replace('proxy_', '');
  console.log(`[Proxy Client] 查找代理连接: ${configId}`);

  const sessions = getProxySessions();
  
  // 查找该配置的最新会话
  for (const [sessionId, session] of sessions.entries()) {
    if (session.configId === configId && session.mcpClient) {
      console.log(`[Proxy Client] 找到代理会话: ${sessionId}, configId: ${configId}`);
      return session.mcpClient;
    }
  }

  throw new Error(`代理会话不存在，configId: ${configId}。请确保已通过代理SSE端点建立连接。`);
}

/**
 * 检查连接ID是否是代理连接
 */
export function isProxyConnection(connectionId: string): boolean {
  return connectionId.startsWith('proxy_');
}

/**
 * 获取所有活跃的代理会话的 configId 列表
 */
export function getActiveProxyConfigIds(): string[] {
  const sessions = getProxySessions();
  const configIds = new Set<string>();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.configId && session.mcpClient) {
      configIds.add(session.configId);
    }
  }
  return Array.from(configIds);
}

/**
 * 根据 configId 检查是否有活跃的代理会话
 */
export function hasActiveProxySession(configId: string): boolean {
  const sessions = getProxySessions();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.configId === configId && session.mcpClient) {
      return true;
    }
  }
  return false;
}

