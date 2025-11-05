import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
    try {
        const resolvedParams = params instanceof Promise ? await params : params;
        const filePath = resolvedParams.path.join('/');
        
        // 安全检查：防止路径遍历攻击
        if (filePath.includes('..')) {
            return NextResponse.json(
                { error: 'Invalid file path' },
                { status: 400 }
            );
        }
        
        // 清理路径，移除开头的斜杠
        const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

        const fullPath = path.join(UPLOADS_DIR, cleanPath);

        // 验证文件是否存在
        try {
            const stats = await fs.stat(fullPath);
            if (!stats.isFile()) {
                return NextResponse.json(
                    { error: 'File not found' },
                    { status: 404 }
                );
            }
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return NextResponse.json(
                    { error: 'File not found' },
                    { status: 404 }
                );
            }
            throw error;
        }

        // 读取文件
        const fileBuffer = await fs.readFile(fullPath);
        
        // 根据文件扩展名确定 Content-Type
        const ext = path.extname(cleanPath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
        };
        const contentType = contentTypeMap[ext] || 'application/octet-stream';

        // 返回文件
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('读取上传文件失败:', error);
        return NextResponse.json(
            {
                error: 'Failed to read file',
                message: error.message || '读取文件时发生错误',
            },
            { status: 500 }
        );
    }
}

