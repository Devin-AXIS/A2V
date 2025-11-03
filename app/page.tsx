'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';

interface LogEntry {
  type: 'info' | 'success' | 'error';
  message: string;
  timestamp: string;
}

interface Tool {
  name: string;
  description?: string;
  inputSchema?: {
    properties?: Record<string, any>;
    required?: string[];
  };
}

interface Resource {
  uri: string;
  name?: string;
  description?: string;
}

interface Prompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export default function Home() {
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [connectionType, setConnectionType] = useState<'url' | 'command' | 'script'>('url');
  const [script, setScript] = useState<string>('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // 模态框状态
  const [toolModal, setToolModal] = useState<{ show: boolean; tool: Tool | null }>({
    show: false,
    tool: null,
  });
  const [resourceModal, setResourceModal] = useState<{ show: boolean; content: any }>({
    show: false,
    content: null,
  });
  const [promptModal, setPromptModal] = useState<{ show: boolean; prompt: Prompt | null }>({
    show: false,
    prompt: null,
  });
  const [toolResultModal, setToolResultModal] = useState<{
    show: boolean;
    result: any;
    toolName: string;
    tokenDistribution?: any;
  }>({
    show: false,
    result: null,
    toolName: '',
  });

  // 获取钱包连接状态
  const { address: walletAddress, isConnected: walletConnected } = useWallet();
  const [saveConfigModal, setSaveConfigModal] = useState<{ show: boolean }>({
    show: false,
  });
  const [savedConfigLink, setSavedConfigLink] = useState<string | null>(null);
  const [savedProxyLink, setSavedProxyLink] = useState<string | null>(null);
  const [configTitle, setConfigTitle] = useState<string>('');
  const [configDescription, setConfigDescription] = useState<string>('');
  const [currentConfigLink, setCurrentConfigLink] = useState<string | null>(null);
  const [mcpUrl, setMcpUrl] = useState<string>('https://mcp.fastgpt.io/ge59csMrueEUs54Z6sZY6yrY/sse');

  const toolFormRef = useRef<HTMLFormElement>(null);
  const promptFormRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const [autoConnecting, setAutoConnecting] = useState(false);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = formData.get('url') as string;
    const command = formData.get('command') as string;
    const args = (formData.get('args') as string || '').trim().split(/\s+/).filter(Boolean);
    const connectionIdInput = formData.get('connectionId') as string;

    let connectionInfo = '';
    let requestBody: any = { connectionId: connectionIdInput || undefined };

    if (connectionType === 'script') {
      // 解析接入脚本
      connectionInfo = '接入脚本';
      try {
        const scriptData = JSON.parse(script.trim());
        requestBody = {
          ...requestBody,
          script: scriptData,
        };
        addLog('info', `正在解析接入脚本...`);
      } catch (error: any) {
        setConnectionStatus({ type: 'error', message: `✗ 脚本格式错误: ${error.message}` });
        addLog('error', `脚本格式错误: ${error.message}`);
        return;
      }
    } else if (connectionType === 'url') {
      connectionInfo = url;
      requestBody.url = url;
    } else {
      connectionInfo = `${command} ${args.join(' ')}`;
      requestBody.command = command;
      requestBody.args = args;
    }

    addLog('info', `正在连接MCP服务器: ${connectionInfo}`);

    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        let newConnectionId = data.connectionId;
        let isProxy = data.isProxy || false;
        let configId = data.configId;

        // 确保代理连接使用正确的 connectionId 格式
        if (isProxy && configId) {
          newConnectionId = `proxy_${configId}`;
          console.log(`[Frontend] 确保代理连接ID格式正确: ${newConnectionId}`);
        } else if (!isProxy && configId) {
          // 如果服务器返回了 configId 但没有标记为代理，手动设置为代理
          newConnectionId = `proxy_${configId}`;
          isProxy = true;
          console.log(`[Frontend] 手动设置为代理连接: ${newConnectionId}`);
        }

        setConnectionId(newConnectionId);
        console.log(`[Frontend] 设置的 connectionId: ${newConnectionId}, isProxy: ${isProxy}`);
        setConnectionStatus({ type: 'success', message: `✓ 已连接 (ID: ${newConnectionId})` });
        addLog('success', `连接成功: ${newConnectionId}`);

        // 连接成功后自动获取可用资源
        // 使用新连接ID直接调用，避免状态更新延迟问题
        setTimeout(async () => {
          addLog('info', '正在自动获取可用资源...');
          try {
            let toolsRes, resourcesRes, promptsRes;

            // 如果是代理连接，使用代理API端点
            if (isProxy && configId) {
              addLog('info', '检测到代理连接，使用代理API端点...');
              [toolsRes, resourcesRes, promptsRes] = await Promise.all([
                fetch(`/api/proxy/${configId}/tools`),
                fetch(`/api/proxy/${configId}/resources`),
                fetch(`/api/proxy/${configId}/prompts`),
              ]);
            } else {
              // 普通连接，使用标准API端点
              [toolsRes, resourcesRes, promptsRes] = await Promise.all([
                fetch(`/api/tools/${newConnectionId}`),
                fetch(`/api/resources/${newConnectionId}`),
                fetch(`/api/prompts/${newConnectionId}`),
              ]);
            }

            const toolsData = await toolsRes.json();
            if (toolsData.success) {
              setTools(toolsData.tools || []);
              if (toolsData.message) {
                addLog('info', toolsData.message);
              }
              addLog('success', `获取到 ${toolsData.tools?.length || 0} 个工具`);
            } else {
              addLog('error', `获取工具失败: ${toolsData.error || toolsData.message}`);
            }

            const resourcesData = await resourcesRes.json();
            if (resourcesData.success) {
              setResources(resourcesData.resources || []);
              if (resourcesData.message) {
                addLog('info', resourcesData.message);
              }
              addLog('success', `获取到 ${resourcesData.resources?.length || 0} 个资源`);
            } else {
              addLog('error', `获取资源失败: ${resourcesData.error || resourcesData.message}`);
            }

            const promptsData = await promptsRes.json();
            if (promptsData.success) {
              setPrompts(promptsData.prompts || []);
              if (promptsData.message) {
                addLog('info', promptsData.message);
              }
              addLog('success', `获取到 ${promptsData.prompts?.length || 0} 个提示词`);
            } else {
              addLog('error', `获取提示词失败: ${promptsData.error || promptsData.message}`);
            }
          } catch (error: any) {
            addLog('error', `自动获取资源失败: ${error.message}`);
            console.error('自动获取资源错误:', error);
          }
        }, 500);
      } else {
        throw new Error(data.error || data.message || '连接失败');
      }
    } catch (error: any) {
      setConnectionStatus({ type: 'error', message: `✗ 连接失败: ${error.message}` });
      addLog('error', `连接失败: ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    if (!connectionId) return;

    try {
      const response = await fetch('/api/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      const data = await response.json();
      if (data.success) {
        setConnectionId(null);
        setConnectionStatus(null);
        setTools([]);
        setResources([]);
        setPrompts([]);
        setCurrentConfigLink(null);
        addLog('info', '连接已断开');
      }
    } catch (error: any) {
      addLog('error', `断开连接失败: ${error.message}`);
    }
  };

  const listTools = async () => {
    if (!connectionId) {
      addLog('error', '未连接，无法获取工具列表');
      return;
    }

    addLog('info', '正在获取工具列表...');

    try {
      // 检测是否是代理连接
      let url = `/api/tools/${connectionId}`;
      if (connectionId.startsWith('proxy_')) {
        const configId = connectionId.replace('proxy_', '');
        url = `/api/proxy/${configId}/tools`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setTools(data.tools || []);
        if (data.message) {
          addLog('info', data.message);
        }
        addLog('success', `获取到 ${data.tools?.length || 0} 个工具`);
      } else {
        throw new Error(data.error || data.message || '获取工具列表失败');
      }
    } catch (error: any) {
      const errorMessage = error.message || '获取工具列表失败';
      addLog('error', `获取工具列表失败: ${errorMessage}`);
      console.error('获取工具列表错误:', error);
    }
  };

  const listResources = async () => {
    if (!connectionId) {
      addLog('error', '未连接，无法获取资源列表');
      return;
    }

    addLog('info', '正在获取资源列表...');

    try {
      // 检测是否是代理连接
      let url = `/api/resources/${connectionId}`;
      if (connectionId.startsWith('proxy_')) {
        const configId = connectionId.replace('proxy_', '');
        url = `/api/proxy/${configId}/resources`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setResources(data.resources || []);
        if (data.message) {
          addLog('info', data.message);
        }
        addLog('success', `获取到 ${data.resources?.length || 0} 个资源`);
      } else {
        throw new Error(data.error || data.message || '获取资源列表失败');
      }
    } catch (error: any) {
      const errorMessage = error.message || '获取资源列表失败';
      addLog('error', `获取资源列表失败: ${errorMessage}`);
      console.error('获取资源列表错误:', error);
    }
  };

  const listPrompts = async () => {
    if (!connectionId) {
      addLog('error', '未连接，无法获取提示词列表');
      return;
    }

    addLog('info', '正在获取提示词列表...');

    try {
      // 检测是否是代理连接
      let url = `/api/prompts/${connectionId}`;
      if (connectionId.startsWith('proxy_')) {
        const configId = connectionId.replace('proxy_', '');
        url = `/api/proxy/${configId}/prompts`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setPrompts(data.prompts || []);
        if (data.message) {
          addLog('info', data.message);
        }
        addLog('success', `获取到 ${data.prompts?.length || 0} 个提示词`);
      } else {
        throw new Error(data.error || data.message || '获取提示词列表失败');
      }
    } catch (error: any) {
      const errorMessage = error.message || '获取提示词列表失败';
      addLog('error', `获取提示词列表失败: ${errorMessage}`);
      console.error('获取提示词列表错误:', error);
    }
  };

  const openToolModal = (tool: Tool) => {
    setToolModal({ show: true, tool });
  };

  const callTool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!connectionId || !toolModal.tool) return;

    const formData = new FormData(e.currentTarget);
    const args: Record<string, string> = {};
    toolModal.tool.inputSchema?.properties &&
      Object.keys(toolModal.tool.inputSchema.properties).forEach((key) => {
        const value = formData.get(`arg_${key}`) as string;
        if (value?.trim()) {
          args[key] = value.trim();
        }
      });

    addLog('info', `正在调用工具: ${toolModal.tool.name}`);

    // 检查是否是代理连接（需要钱包地址来分发代币）
    const isProxy = connectionId.startsWith('proxy_');
    if (isProxy && !walletAddress) {
      addLog('error', '请先连接 MetaMask 钱包以接收代币奖励');
      alert('请先连接 MetaMask 钱包以接收代币奖励');
      return;
    }

    try {
      const response = await fetch('/api/call-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          toolName: toolModal.tool.name,
          arguments: args,
          walletAddress: isProxy ? walletAddress : undefined, // 只在代理连接时传递钱包地址
        }),
      });

      const data = await response.json();
      if (data.success) {
        addLog('success', `工具 ${toolModal.tool.name} 调用成功`);

        // 如果成功分发代币，记录日志
        if (data.tokenDistribution?.success) {
          addLog('success', `🎁 代币奖励: ${data.tokenDistribution.amount} 代币已分发到您的钱包`);
        } else if (data.tokenDistribution && !data.tokenDistribution.success) {
          addLog('error', `代币分发失败: ${data.tokenDistribution.error || '未知错误'}`);
        }

        // 显示结果模态框
        setToolResultModal({
          show: true,
          result: data.result,
          toolName: toolModal.tool.name,
          tokenDistribution: data.tokenDistribution,
        });
        // 关闭工具调用模态框
        setToolModal({ show: false, tool: null });
      } else {
        throw new Error(data.error || '调用工具失败');
      }
    } catch (error: any) {
      addLog('error', `调用工具失败: ${error.message}`);
    }
  };

  const readResource = async (uri: string) => {
    if (!connectionId) return;

    addLog('info', `正在读取资源: ${uri}`);

    try {
      const response = await fetch('/api/read-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, uri }),
      });

      const data = await response.json();
      if (data.success) {
        setResourceModal({ show: true, content: data.result });
        addLog('success', `资源 ${uri} 读取成功`);
      } else {
        throw new Error(data.error || '读取资源失败');
      }
    } catch (error: any) {
      addLog('error', `读取资源失败: ${error.message}`);
      alert(`读取资源失败: ${error.message}`);
    }
  };

  const openPromptModal = (prompt: Prompt) => {
    setPromptModal({ show: true, prompt });
  };

  const getPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!connectionId || !promptModal.prompt) return;

    const formData = new FormData(e.currentTarget);
    const args: Record<string, string> = {};
    promptModal.prompt.arguments?.forEach((arg) => {
      const value = formData.get(`prompt_arg_${arg.name}`) as string;
      if (value?.trim()) {
        args[arg.name] = value.trim();
      }
    });

    addLog('info', `正在获取提示词: ${promptModal.prompt.name}`);

    try {
      const response = await fetch('/api/get-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId,
          promptName: promptModal.prompt.name,
          arguments: args,
        }),
      });

      const data = await response.json();
      if (data.success) {
        addLog('success', `提示词 ${promptModal.prompt.name} 获取成功`);
        // 将提示词结果作为资源显示
        setResourceModal({ show: true, content: data.result });
        setPromptModal({ show: false, prompt: null });
      } else {
        throw new Error(data.error || '获取提示词失败');
      }
    } catch (error: any) {
      addLog('error', `获取提示词失败: ${error.message}`);
    }
  };

  const handleSaveConfig = () => {
    // 检查是否有连接
    if (!connectionId) {
      alert('请先连接到MCP服务器');
      return;
    }
    setSaveConfigModal({ show: true });
    setSavedConfigLink(null);
    setSavedProxyLink(null);
    setConfigTitle('');
    setConfigDescription('');
  };

  const handleSaveConfigSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!configTitle.trim() || !configDescription.trim()) {
      alert('请填写标题和介绍');
      return;
    }

    // 获取当前的连接配置
    const forms = document.querySelectorAll('form');
    const connectForm = Array.from(forms).find(form => form.querySelector('#connectionType'));
    if (!connectForm) {
      alert('无法获取当前连接配置，请确保已连接到MCP服务器');
      return;
    }

    const formData = new FormData(connectForm);
    const url = formData.get('url') as string;
    const command = formData.get('command') as string;
    const args = (formData.get('args') as string || '').trim().split(/\s+/).filter(Boolean);
    const connectionIdInput = formData.get('connectionId') as string;

    // 构建连接配置
    const connectionConfig: any = { connectionId: connectionIdInput || undefined };

    if (connectionType === 'script') {
      try {
        const scriptData = JSON.parse(script.trim());
        connectionConfig.script = scriptData;
      } catch (error: any) {
        alert(`脚本格式错误: ${error.message}`);
        return;
      }
    } else if (connectionType === 'url') {
      connectionConfig.url = url;
    } else {
      connectionConfig.command = command;
      connectionConfig.args = args;
    }

    addLog('info', '正在保存MCP配置...');

    try {
      const response = await fetch('/api/save-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: configTitle.trim(),
          description: configDescription.trim(),
          connectionType,
          connectionConfig,
        }),
      });

      const data = await response.json();
      if (data.success) {
        addLog('success', `MCP配置保存成功: ${data.url}`);
        setSavedConfigLink(data.url);
        setSavedProxyLink(data.proxyUrl || null);
        // 不关闭弹窗，让用户看到链接
      } else {
        throw new Error(data.error || data.message || '保存失败');
      }
    } catch (error: any) {
      addLog('error', `保存MCP配置失败: ${error.message}`);
      alert(`保存失败: ${error.message}`);
    }
  };

  // 从配置ID自动连接
  const autoConnectFromConfig = async (configId: string) => {
    if (autoConnecting || connectionId) {
      return; // 避免重复连接
    }

    setAutoConnecting(true);
    addLog('info', `正在加载配置: ${configId}...`);

    try {
      // 获取配置
      const configRes = await fetch(`/api/config/${configId}`);
      const configData = await configRes.json();

      if (!configData.success) {
        throw new Error(configData.error || configData.message || '获取配置失败');
      }

      const config = configData.config;
      addLog('info', `配置加载成功: ${config.title}`);

      // 设置连接类型和脚本（如果需要）
      setConnectionType(config.connectionType);
      if (config.connectionType === 'script' && config.connectionConfig.script) {
        setScript(JSON.stringify(config.connectionConfig.script, null, 2));
      }

      // 构建连接请求
      // 对于代理连接，应该传递代理 URL 而不是原始 MCP URL
      // 这样 /api/connect 才能识别为代理连接并返回 proxy_${configId}
      const proxyUrl = `${window.location.origin}/api/proxy/${configId}/sse`;

      addLog('info', '正在使用保存的配置连接MCP服务器（代理模式）...');
      addLog('info', `代理URL: ${proxyUrl}`);

      // 直接使用代理URL连接，这样会被识别为代理连接
      const requestBody = {
        url: proxyUrl,
      };

      // 连接
      const connectRes = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const connectData = await connectRes.json();

      if (connectData.success) {
        let newConnectionId = connectData.connectionId;
        let isProxy = connectData.isProxy || false;
        let proxyConfigId = connectData.configId;

        // 确保代理连接使用正确的 connectionId 格式
        if (isProxy && proxyConfigId) {
          newConnectionId = `proxy_${proxyConfigId}`;
          console.log(`[Frontend] 确保代理连接ID格式正确: ${newConnectionId}`);
        } else if (!isProxy && proxyConfigId) {
          // 如果服务器返回了 configId 但没有标记为代理，手动设置为代理
          newConnectionId = `proxy_${proxyConfigId}`;
          isProxy = true;
          console.log(`[Frontend] 手动设置为代理连接: ${newConnectionId}`);
        }

        setConnectionId(newConnectionId);
        console.log(`[Frontend] 设置的 connectionId: ${newConnectionId}, isProxy: ${isProxy}`);

        // 生成配置访问链接（使用?configId参数格式）
        const configUrl = `${window.location.origin}/api/proxy/${configId}/sse`;
        setCurrentConfigLink(configUrl);
        setMcpUrl(configUrl);

        setConnectionStatus({ type: 'success', message: `✓ 已使用配置自动连接 (ID: ${newConnectionId})` });
        addLog('success', `使用配置自动连接成功: ${newConnectionId}`);

        // 连接成功后自动获取可用资源
        setTimeout(async () => {
          addLog('info', '正在自动获取可用资源...');
          try {
            let toolsRes, resourcesRes, promptsRes;

            // 如果是代理连接，使用代理API端点
            if (isProxy && proxyConfigId) {
              addLog('info', '检测到代理连接，使用代理API端点...');
              [toolsRes, resourcesRes, promptsRes] = await Promise.all([
                fetch(`/api/proxy/${proxyConfigId}/tools`),
                fetch(`/api/proxy/${proxyConfigId}/resources`),
                fetch(`/api/proxy/${proxyConfigId}/prompts`),
              ]);
            } else {
              // 普通连接，使用标准API端点
              [toolsRes, resourcesRes, promptsRes] = await Promise.all([
                fetch(`/api/tools/${newConnectionId}`),
                fetch(`/api/resources/${newConnectionId}`),
                fetch(`/api/prompts/${newConnectionId}`),
              ]);
            }

            const toolsData = await toolsRes.json();
            if (toolsData.success) {
              setTools(toolsData.tools || []);
              if (toolsData.message) {
                addLog('info', toolsData.message);
              }
              addLog('success', `获取到 ${toolsData.tools?.length || 0} 个工具`);
            } else {
              addLog('error', `获取工具失败: ${toolsData.error || toolsData.message}`);
            }

            const resourcesData = await resourcesRes.json();
            if (resourcesData.success) {
              setResources(resourcesData.resources || []);
              if (resourcesData.message) {
                addLog('info', resourcesData.message);
              }
              addLog('success', `获取到 ${resourcesData.resources?.length || 0} 个资源`);
            } else {
              addLog('error', `获取资源失败: ${resourcesData.error || resourcesData.message}`);
            }

            const promptsData = await promptsRes.json();
            if (promptsData.success) {
              setPrompts(promptsData.prompts || []);
              if (promptsData.message) {
                addLog('info', promptsData.message);
              }
              addLog('success', `获取到 ${promptsData.prompts?.length || 0} 个提示词`);
            } else {
              addLog('error', `获取提示词失败: ${promptsData.error || promptsData.message}`);
            }
          } catch (error: any) {
            addLog('error', `自动获取资源失败: ${error.message}`);
            console.error('自动获取资源错误:', error);
          }
        }, 500);
      } else {
        throw new Error(connectData.error || connectData.message || '连接失败');
      }
    } catch (error: any) {
      setConnectionStatus({ type: 'error', message: `✗ 自动连接失败: ${error.message}` });
      addLog('error', `使用配置自动连接失败: ${error.message}`);
    } finally {
      setAutoConnecting(false);
    }
  };

  // 检查URL参数，自动连接
  useEffect(() => {
    if (!searchParams) return;

    const configId = searchParams.get('configId');
    if (configId && !autoConnecting && !connectionId) {
      autoConnectFromConfig(configId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const isConnected = !!connectionId;

  return (
    <div className="container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1>🤖 MCP 服务器调用工具</h1>
            <p>使用官方 MCP SDK 连接和调用 MCP 服务器</p>
          </div>
          <div>
            <Link href="/configs" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              📋 配置列表
            </Link>
          </div>
        </div>
      </header>

      {/* 使用说明区域 */}
      <section className="card" style={{ background: '#f0f7ff', borderLeft: '4px solid #2196F3' }}>
        <h2>📖 使用流程说明</h2>
        <div style={{ lineHeight: '1.8' }}>
          <h3>什么是 MCP？</h3>
          <p>
            <strong>MCP (Model Context Protocol)</strong> 是一个标准协议，允许 AI
            应用程序访问外部工具、资源和提示词。通过 MCP，你可以让 AI 调用各种功能，比如：
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>🌐 <strong>工具 (Tools)</strong>：执行特定操作，如搜索、计算、API 调用等</li>
            <li>📁 <strong>资源 (Resources)</strong>：访问数据文件、数据库信息等</li>
            <li>💬 <strong>提示词 (Prompts)</strong>：获取预设的提示词模板</li>
          </ul>

          <h3>完整调用流程（3步）：</h3>
          <ol style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>
              <strong>步骤 1：连接</strong>
              <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                <li>选择连接类型（URL、接入脚本或命令行）</li>
                <li>输入连接信息</li>
                <li>点击"连接"按钮</li>
                <li>✅ 连接成功后会<strong>自动加载</strong>所有可用工具、资源和提示词</li>
              </ul>
            </li>
            <li>
              <strong>步骤 2：查看可用内容</strong>
              <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                <li>连接成功后，下方会自动显示：工具列表、资源列表、提示词列表</li>
                <li>如果为空，说明该 MCP 服务器没有提供这些功能</li>
              </ul>
            </li>
            <li>
              <strong>步骤 3：调用</strong>
              <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
                <li>
                  <strong>调用工具</strong>：点击工具旁的"调用" → 填写参数 → 点击"执行" → <strong>查看返回结果</strong>
                </li>
                <li>
                  <strong>读取资源</strong>：点击资源旁的"读取" → 查看资源内容
                </li>
                <li>
                  <strong>获取提示词</strong>：点击提示词旁的"获取" → 填写参数 → 获取提示词内容
                </li>
              </ul>
            </li>
          </ol>

          <div
            style={{
              padding: '12px',
              background: '#fff3cd',
              borderRadius: '4px',
              marginTop: '16px',
              borderLeft: '4px solid #ffc107',
            }}
          >
            <strong>💡 提示：</strong>
            <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
              <li>连接成功后会自动列出所有可用内容，无需手动点击"列出"</li>
              <li>所有操作的结果都会显示在日志区域，方便追踪</li>
              <li>工具调用结果会在弹窗中清晰显示</li>
              <li>如果调用失败，查看日志了解详细错误信息</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="main-content">
        {/* 连接配置区域 */}
        <section className="card">
          <h2>连接配置</h2>
          <form onSubmit={handleConnect}>
            <div className="form-group">
              <label htmlFor="connectionType">连接类型:</label>
              <select
                id="connectionType"
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value as 'url' | 'command' | 'script')}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              >
                <option value="url">URL 连接 (SSE) - 用于 FastGPT 等远程服务器</option>
                <option value="script">接入脚本 (JSON) - 使用 FastGPT 提供的接入脚本</option>
                <option value="command">命令行连接 (Stdio) - 用于本地服务器</option>
              </select>
              <small>
                {connectionType === 'url'
                  ? '输入 MCP 服务器的 SSE URL 地址'
                  : connectionType === 'script'
                    ? '粘贴 FastGPT 提供的接入脚本（JSON 格式）'
                    : '通过命令行启动本地 MCP 服务器'}
              </small>
            </div>

            {connectionType === 'script' ? (
              <div className="form-group">
                <label htmlFor="script">接入脚本 (JSON):</label>
                <textarea
                  id="script"
                  name="script"
                  rows={8}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder={`{\n  "url": "https://mcp.fastgpt.io/your-path/sse",\n  "name": "FastGPT MCP Server",\n  ...\n}`}
                  required={connectionType === 'script'}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    resize: 'vertical',
                  }}
                />
                <small>
                  粘贴从 FastGPT 获取的完整接入脚本（JSON 格式）。脚本应包含 URL 和其他连接配置信息。
                </small>
              </div>
            ) : connectionType === 'url' ? (
              <div className="form-group">
                <label htmlFor="url">MCP 服务器 URL:</label>
                <input
                  type="url"
                  id="url"
                  name="url"
                  placeholder="https://mcp.fastgpt.io/your-path/sse"
                  defaultValue={currentConfigLink || "https://mcp.fastgpt.io/ge59csMrueEUs54Z6sZY6yrY/sse"}
                  required={connectionType === 'url'}
                  style={{ fontFamily: 'monospace' }}
                  value={mcpUrl}
                  onChange={(e) => setMcpUrl(e.target.value)}
                />
                <small>输入完整的 SSE 端点 URL（例如 FastGPT MCP 服务器地址）</small>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="command">命令 (Command):</label>
                  <input
                    type="text"
                    id="command"
                    name="command"
                    placeholder="例如: node, python, npm"
                    required={connectionType === 'command'}
                  />
                  <small>要执行的命令（如 node, python, npm 等）</small>
                </div>

                <div className="form-group">
                  <label htmlFor="args">参数 (Arguments):</label>
                  <input
                    type="text"
                    id="args"
                    name="args"
                    placeholder="例如: server.js 或 --version"
                    required={connectionType === 'command'}
                  />
                  <small>命令参数，多个参数用空格分隔</small>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="connectionId">连接ID (可选):</label>
              <input
                type="text"
                id="connectionId"
                name="connectionId"
                placeholder="留空将自动生成"
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                连接
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                className="btn btn-secondary"
                disabled={!isConnected}
              >
                断开连接
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="btn btn-secondary"
                disabled={!isConnected}
                style={{ marginLeft: '8px' }}
              >
                保存MCP配置
              </button>
            </div>
          </form>

          {connectionStatus && (
            <div className={`status ${connectionStatus.type}`}>
              {connectionStatus.message}
              {isConnected && (
                <div style={{ marginTop: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>🛠️ 工具: <strong>{tools.length}</strong> 个</span>
                    <span>📁 资源: <strong>{resources.length}</strong> 个</span>
                    <span>💬 提示词: <strong>{prompts.length}</strong> 个</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 显示当前配置的链接（如果是从配置列表进入的） */}
          {currentConfigLink && isConnected && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#e3f2fd',
              borderRadius: '4px',
              borderLeft: '4px solid #2196F3'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '16px', color: '#1976d2' }}>
                    🔗 配置访问链接
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    此链接可用于直接访问此MCP配置并自动连接
                  </p>
                  <div style={{
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #90caf9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <input
                      type="text"
                      value={currentConfigLink}
                      readOnly
                      style={{
                        flex: 1,
                        padding: '8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'text',
                        outline: 'none',
                      }}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        try {
                          navigator.clipboard.writeText(currentConfigLink);
                          alert('链接已复制到剪贴板');
                        } catch {
                          document.execCommand('copy');
                          alert('链接已复制到剪贴板');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard.writeText(currentConfigLink);
                          alert('链接已复制到剪贴板');
                        } catch {
                          document.execCommand('copy');
                          alert('链接已复制到剪贴板');
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      复制链接
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 工具区域 */}
        <section className="card">
          <h2>
            工具 (Tools) {isConnected && <span style={{ fontSize: '16px', color: '#666' }}>({tools.length})</span>}
          </h2>
          <div className="button-group">
            <button
              onClick={listTools}
              className="btn btn-primary"
              disabled={!isConnected}
            >
              {tools.length > 0 ? '刷新工具列表' : '列出工具'}
            </button>
          </div>

          <div className="list-container">
            {!isConnected ? (
              <div className="empty-state" style={{ color: '#999' }}>
                请先连接到 MCP 服务器
              </div>
            ) : tools.length === 0 ? (
              <div className="empty-state">
                该 MCP 服务器没有提供工具功能
                <br />
                <small style={{ color: '#999', marginTop: '8px', display: 'block' }}>
                  如果应该有工具，请点击"刷新工具列表"重试
                </small>
              </div>
            ) : (
              tools.map((tool) => (
                <div key={tool.name} className="list-item">
                  <h3>{tool.name}</h3>
                  <p>{tool.description || '无描述'}</p>
                  {tool.inputSchema?.properties && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      <strong>参数:</strong>{' '}
                      {Object.keys(tool.inputSchema.properties).join(', ') || '无'}
                    </div>
                  )}
                  <div className="item-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => openToolModal(tool)}
                    >
                      调用工具
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 资源区域 */}
        <section className="card">
          <h2>
            资源 (Resources){' '}
            {isConnected && <span style={{ fontSize: '16px', color: '#666' }}>({resources.length})</span>}
          </h2>
          <div className="button-group">
            <button
              onClick={listResources}
              className="btn btn-primary"
              disabled={!isConnected}
            >
              {resources.length > 0 ? '刷新资源列表' : '列出资源'}
            </button>
          </div>

          <div className="list-container">
            {!isConnected ? (
              <div className="empty-state" style={{ color: '#999' }}>
                请先连接到 MCP 服务器
              </div>
            ) : resources.length === 0 ? (
              <div className="empty-state">
                该 MCP 服务器没有提供资源功能
                <br />
                <small style={{ color: '#999', marginTop: '8px', display: 'block' }}>
                  如果应该有资源，请点击"刷新资源列表"重试
                </small>
              </div>
            ) : (
              resources.map((resource) => (
                <div key={resource.uri} className="list-item">
                  <h3>{resource.name || resource.uri}</h3>
                  <p>{resource.description || resource.uri || '无描述'}</p>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                    URI: {resource.uri}
                  </div>
                  <div className="item-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => readResource(resource.uri)}
                    >
                      读取资源
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 提示词区域 */}
        <section className="card">
          <h2>
            提示词 (Prompts){' '}
            {isConnected && <span style={{ fontSize: '16px', color: '#666' }}>({prompts.length})</span>}
          </h2>
          <div className="button-group">
            <button
              onClick={listPrompts}
              className="btn btn-primary"
              disabled={!isConnected}
            >
              {prompts.length > 0 ? '刷新提示词列表' : '列出提示词'}
            </button>
          </div>

          <div className="list-container">
            {!isConnected ? (
              <div className="empty-state" style={{ color: '#999' }}>
                请先连接到 MCP 服务器
              </div>
            ) : prompts.length === 0 ? (
              <div className="empty-state">
                该 MCP 服务器没有提供提示词功能
                <br />
                <small style={{ color: '#999', marginTop: '8px', display: 'block' }}>
                  如果应该有提示词，请点击"刷新提示词列表"重试
                </small>
              </div>
            ) : (
              prompts.map((prompt) => (
                <div key={prompt.name} className="list-item">
                  <h3>{prompt.name}</h3>
                  <p>{prompt.description || '无描述'}</p>
                  {prompt.arguments && prompt.arguments.length > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      <strong>参数:</strong>{' '}
                      {prompt.arguments.map((arg) => arg.name).join(', ')}
                    </div>
                  )}
                  <div className="item-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => openPromptModal(prompt)}
                    >
                      获取提示词
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 响应日志区域 */}
        <section className="card">
          <h2>响应日志</h2>
          <div className="button-group">
            <button
              onClick={() => setLogs([])}
              className="btn btn-secondary"
            >
              清空日志
            </button>
          </div>
          <div className="log-container">
            {logs.map((log, index) => (
              <div key={index} className={`log-entry ${log.type}`}>
                <span className="timestamp">[{log.timestamp}]</span>
                <span className="message">{log.message}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 工具调用模态框 */}
      {toolModal.show && toolModal.tool && (
        <div
          className="modal show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setToolModal({ show: false, tool: null });
          }}
        >
          <div className="modal-content">
            <span className="close" onClick={() => setToolModal({ show: false, tool: null })}>
              &times;
            </span>
            <h2>调用工具: {toolModal.tool.name}</h2>
            <div>
              <p>{toolModal.tool.description || '无描述'}</p>
            </div>
            <form ref={toolFormRef} onSubmit={callTool}>
              <div>
                {toolModal.tool.inputSchema?.properties ? (
                  Object.keys(toolModal.tool.inputSchema.properties).map((key) => {
                    const prop = toolModal.tool.inputSchema!.properties![key];
                    const isRequired =
                      toolModal.tool.inputSchema!.required?.includes(key);
                    return (
                      <div key={key} className="arg-input">
                        <label>
                          {key} {isRequired && <span style={{ color: 'red' }}>*</span>}
                        </label>
                        <input
                          type="text"
                          name={`arg_${key}`}
                          placeholder={prop.description || ''}
                          required={isRequired}
                        />
                        <small>
                          {prop.description || ''} (类型: {prop.type || 'string'})
                        </small>
                      </div>
                    );
                  })
                ) : (
                  <p>此工具不需要参数</p>
                )}
              </div>
              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  执行
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setToolModal({ show: false, tool: null })}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 资源读取模态框 */}
      {resourceModal.show && (
        <div
          className="modal show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setResourceModal({ show: false, content: null });
          }}
        >
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setResourceModal({ show: false, content: null })}
            >
              &times;
            </span>
            <h2>读取资源</h2>
            <div className="result-container">
              <h3>资源内容:</h3>
              <pre>{JSON.stringify(resourceModal.content, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* 工具调用结果模态框 */}
      {toolResultModal.show && (
        <div
          className="modal show"
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setToolResultModal({ show: false, result: null, toolName: '', tokenDistribution: undefined });
          }}
        >
          <div className="modal-content" style={{ maxWidth: '800px' }}>
            <span
              className="close"
              onClick={() => setToolResultModal({ show: false, result: null, toolName: '', tokenDistribution: undefined })}
            >
              &times;
            </span>
            <h2>工具调用结果: {toolResultModal.toolName}</h2>
            <div className="result-container">
              <h3>返回结果:</h3>
              <div style={{ marginBottom: '12px' }}>
                <small style={{ color: '#666' }}>
                  {toolResultModal.result?.content
                    ? '工具执行成功！'
                    : '查看下方返回的详细数据'}
                </small>
              </div>
              <pre
                style={{
                  background: '#f5f5f5',
                  padding: '16px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '500px',
                  fontSize: '13px',
                }}
              >
                {JSON.stringify(toolResultModal.result, null, 2)}
              </pre>
              {toolResultModal.result?.content && (
                <div style={{ marginTop: '16px', padding: '12px', background: '#e8f5e9', borderRadius: '4px' }}>
                  <h4>内容:</h4>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {typeof toolResultModal.result.content === 'string'
                      ? toolResultModal.result.content
                      : JSON.stringify(toolResultModal.result.content, null, 2)}
                  </div>
                </div>
              )}

              {/* 代币分发信息 */}
              {toolResultModal.tokenDistribution && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '4px',
                  background: toolResultModal.tokenDistribution.success ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${toolResultModal.tokenDistribution.success ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                  <h4 style={{
                    marginTop: 0,
                    color: toolResultModal.tokenDistribution.success ? '#155724' : '#721c24'
                  }}>
                    {toolResultModal.tokenDistribution.success ? '🎁 代币奖励已分发' : '❌ 代币分发失败'}
                  </h4>
                  {toolResultModal.tokenDistribution.success ? (
                    <div style={{ color: '#155724' }}>
                      <p><strong>代币数量:</strong> {toolResultModal.tokenDistribution.amount} 代币</p>
                      <p><strong>价值哈希:</strong> <code style={{ fontSize: '11px' }}>{toolResultModal.tokenDistribution.valueHash}</code></p>
                      {toolResultModal.tokenDistribution.authorizeTxHash && (
                        <p>
                          <strong>授权交易:</strong>{' '}
                          <a
                            href={`https://sepolia.basescan.org/tx/${toolResultModal.tokenDistribution.authorizeTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2196F3', fontSize: '12px' }}
                          >
                            {toolResultModal.tokenDistribution.authorizeTxHash.slice(0, 10)}...
                          </a>
                        </p>
                      )}
                      {toolResultModal.tokenDistribution.distributeTxHash && (
                        <p>
                          <strong>分发交易:</strong>{' '}
                          <a
                            href={`https://sepolia.basescan.org/tx/${toolResultModal.tokenDistribution.distributeTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2196F3', fontSize: '12px' }}
                          >
                            {toolResultModal.tokenDistribution.distributeTxHash.slice(0, 10)}...
                          </a>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#721c24' }}>
                      <p><strong>错误:</strong> {toolResultModal.tokenDistribution.error || '未知错误'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="button-group" style={{ marginTop: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setToolResultModal({ show: false, result: null, toolName: '', tokenDistribution: undefined })}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提示词模态框 */}
      {promptModal.show && promptModal.prompt && (
        <div
          className="modal show"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPromptModal({ show: false, prompt: null });
          }}
        >
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setPromptModal({ show: false, prompt: null })}
            >
              &times;
            </span>
            <h2>获取提示词: {promptModal.prompt.name}</h2>
            <div>
              <p>{promptModal.prompt.description || '无描述'}</p>
            </div>
            <form ref={promptFormRef} onSubmit={getPrompt}>
              <div>
                {promptModal.prompt.arguments && promptModal.prompt.arguments.length > 0 ? (
                  promptModal.prompt.arguments.map((arg) => (
                    <div key={arg.name} className="arg-input">
                      <label>
                        {arg.name} {arg.required && <span style={{ color: 'red' }}>*</span>}
                      </label>
                      <input
                        type="text"
                        name={`prompt_arg_${arg.name}`}
                        placeholder={arg.description || ''}
                        required={arg.required}
                      />
                      <small>{arg.description || ''}</small>
                    </div>
                  ))
                ) : (
                  <p>此提示词不需要参数</p>
                )}
              </div>
              <div className="button-group">
                <button type="submit" className="btn btn-primary">
                  获取
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPromptModal({ show: false, prompt: null })}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 保存MCP配置模态框 */}
      {saveConfigModal.show && (
        <div
          className="modal show"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSaveConfigModal({ show: false });
              setSavedConfigLink(null);
            }
          }}
        >
          <div className="modal-content">
            <span
              className="close"
              onClick={() => {
                setSaveConfigModal({ show: false });
                setSavedConfigLink(null);
                setSavedProxyLink(null);
              }}
            >
              &times;
            </span>
            <h2>保存MCP配置</h2>

            {savedConfigLink ? (
              <div>
                <div style={{ padding: '16px', background: '#e8f5e9', borderRadius: '4px', marginBottom: '16px' }}>
                  <h3 style={{ marginTop: 0, color: '#2e7d32' }}>✓ 配置保存成功！</h3>

                  {/* 代理SSE链接（用于直接MCP连接） */}
                  {savedProxyLink && (
                    <>
                      <p style={{ marginBottom: '8px', fontWeight: 'bold', color: '#1976d2' }}>
                        🔗 MCP代理连接链接（用于直接MCP连接）：
                      </p>
                      <div style={{ background: '#fff', padding: '12px', borderRadius: '4px', border: '1px solid #c8e6c9', marginBottom: '16px' }}>
                        <input
                          type="text"
                          value={savedProxyLink}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '8px',
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'text',
                          }}
                          onClick={(e) => {
                            (e.target as HTMLInputElement).select();
                            try {
                              navigator.clipboard.writeText(savedProxyLink);
                              alert('代理链接已复制到剪贴板');
                            } catch {
                              document.execCommand('copy');
                              alert('代理链接已复制到剪贴板');
                            }
                          }}
                        />
                      </div>
                      <p style={{ marginBottom: '16px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                        此链接可直接用于MCP客户端连接，代理端会自动转发消息到实际MCP服务器
                      </p>
                    </>
                  )}

                  {/* 配置页面链接 */}
                  <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                    📋 配置页面链接：
                  </p>
                  <div style={{ background: '#fff', padding: '12px', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
                    <input
                      type="text"
                      value={savedConfigLink}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'text',
                      }}
                      onClick={(e) => {
                        (e.target as HTMLInputElement).select();
                        try {
                          navigator.clipboard.writeText(savedConfigLink);
                          alert('链接已复制到剪贴板');
                        } catch {
                          document.execCommand('copy');
                          alert('链接已复制到剪贴板');
                        }
                      }}
                    />
                  </div>
                  <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                    点击上方链接框可复制链接
                  </p>
                </div>
                <div className="button-group">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSaveConfigModal({ show: false });
                      setSavedConfigLink(null);
                      setSavedProxyLink(null);
                    }}
                  >
                    关闭
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveConfigSubmit}>
                <div className="arg-input">
                  <label>
                    标题 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={configTitle}
                    onChange={(e) => setConfigTitle(e.target.value)}
                    placeholder="请输入配置标题"
                    required
                  />
                  <small>为此MCP配置设置一个易于识别的标题</small>
                </div>
                <div className="arg-input">
                  <label>
                    介绍 <span style={{ color: 'red' }}>*</span>
                  </label>
                  <textarea
                    value={configDescription}
                    onChange={(e) => setConfigDescription(e.target.value)}
                    placeholder="请输入配置介绍和说明"
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px',
                      resize: 'vertical',
                    }}
                  />
                  <small>描述此MCP配置的用途和特点</small>
                </div>
                <div className="button-group">
                  <button type="submit" className="btn btn-primary">
                    确认保存
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSaveConfigModal({ show: false });
                      setSavedConfigLink(null);
                      setSavedProxyLink(null);
                    }}
                  >
                    取消
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
