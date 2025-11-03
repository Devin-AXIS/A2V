'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ConfigPage() {
  const params = useParams();
  const router = useRouter();
  const configId = params?.configId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (!configId) {
      setError('缺少配置ID');
      setLoading(false);
      return;
    }

    // 获取配置
    fetch(`/api/config/${configId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setConfig(data.config);
          // 自动连接到MCP服务器
          connectToMCP(data.config);
        } else {
          setError(data.error || data.message || '获取配置失败');
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(`获取配置失败: ${err.message}`);
        setLoading(false);
      });
  }, [configId]);

  const connectToMCP = async (configData: any) => {
    try {
      // 根据连接类型构建请求体
      const requestBody: any = {
        connectionId: configData.connectionConfig.connectionId || undefined,
      };

      if (configData.connectionType === 'script') {
        requestBody.script = configData.connectionConfig.script;
      } else if (configData.connectionType === 'url') {
        requestBody.url = configData.connectionConfig.url;
      } else {
        requestBody.command = configData.connectionConfig.command;
        requestBody.args = configData.connectionConfig.args;
      }

      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        // 连接成功，重定向到主页面
        router.push(`/?connectionId=${data.connectionId}&autoConnect=true`);
      } else {
        setError(data.error || data.message || '连接失败');
        setLoading(false);
      }
    } catch (err: any) {
      setError(`连接失败: ${err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '18px' }}>正在加载MCP配置...</div>
        <div style={{ fontSize: '14px', color: '#666' }}>请稍候</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px'
      }}>
        <div style={{ fontSize: '18px', color: '#d32f2f' }}>✗ {error}</div>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          返回首页
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ fontSize: '18px' }}>正在连接到MCP服务器...</div>
      <div style={{ fontSize: '14px', color: '#666' }}>{config?.title}</div>
    </div>
  );
}

