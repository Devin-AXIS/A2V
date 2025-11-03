import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/mcp-client';
import { getProxyClient, isProxyConnection } from '@/lib/proxy-client';

export async function POST(request: NextRequest) {
  try {
    const { connectionId, uri } = await request.json();

    if (!connectionId || !uri) {
      return NextResponse.json(
        { error: '缺少connectionId或uri参数' },
        { status: 400 }
      );
    }

    // 检查是否是代理连接
    const client = isProxyConnection(connectionId) 
      ? getProxyClient(connectionId)
      : getClient(connectionId);
    
    const result = await client.readResource({ uri });

    return NextResponse.json({
      success: true,
      result: result,
    });
  } catch (error: any) {
    console.error('读取资源失败:', error);
    return NextResponse.json(
      {
        error: '读取资源失败',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
