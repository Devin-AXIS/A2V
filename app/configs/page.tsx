'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ConfigItem {
  id: string;
  title: string;
  description: string;
  connectionType: 'url' | 'command' | 'script';
  createdAt: string;
}

export default function ConfigsPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/configs');
      const data = await response.json();

      if (data.success) {
        setConfigs(data.configs || []);
      } else {
        setError(data.error || data.message || '获取配置列表失败');
      }
    } catch (err: any) {
      setError(`获取配置列表失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigClick = (configId: string) => {
    // 跳转到主页面，并通过配置自动连接
    router.push(`/?configId=${configId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConnectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      url: 'URL 连接 (SSE)',
      command: '命令行连接 (Stdio)',
      script: '接入脚本 (JSON)',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="container">
        <header>
          <h1>📋 MCP 配置列表</h1>
          <p>所有已保存的 MCP 配置</p>
        </header>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          正在加载配置列表...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <header>
          <h1>📋 MCP 配置列表</h1>
          <p>所有已保存的 MCP 配置</p>
        </header>
        <div className="card" style={{ background: '#ffebee', borderLeft: '4px solid #d32f2f' }}>
          <h3 style={{ color: '#d32f2f', marginTop: 0 }}>✗ 错误</h3>
          <p>{error}</p>
          <button
            onClick={loadConfigs}
            className="btn btn-primary"
            style={{ marginTop: '12px' }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>📋 MCP 配置列表</h1>
        <p>所有已保存的 MCP 配置</p>
        <div style={{ marginTop: '16px' }}>
          <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            ← 返回首页
          </Link>
        </div>
      </header>

      <div className="main-content">
        {configs.length === 0 ? (
          <section className="card">
            <h2>暂无配置</h2>
            <p style={{ color: '#666' }}>
              您还没有保存任何 MCP 配置。
              <br />
              <Link href="/" style={{ color: '#2196F3', textDecoration: 'underline' }}>
                返回首页
              </Link>{' '}
              连接 MCP 服务器后可以保存配置。
            </p>
          </section>
        ) : (
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>已保存的配置 ({configs.length})</h2>
              <button onClick={loadConfigs} className="btn btn-secondary">
                刷新
              </button>
            </div>

            <div className="list-container">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="list-item"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleConfigClick(config.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f5f5f5';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{config.title}</h3>
                      <p style={{ marginBottom: '12px', color: '#666' }}>{config.description}</p>
                      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#999' }}>
                        <span>
                          <strong>类型:</strong> {getConnectionTypeLabel(config.connectionType)}
                        </span>
                        <span>
                          <strong>创建时间:</strong> {formatDate(config.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginLeft: '16px', fontSize: '24px' }}>→</div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#2196F3' }}>
                    点击此配置卡片使用该配置连接 MCP 服务器
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

