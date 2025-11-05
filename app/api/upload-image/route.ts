import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// 确保上传目录存在
async function ensureUploadsDir() {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
    } catch (error) {
        console.error('创建上传目录失败:', error);
        throw error;
    }
}

// 获取文件扩展名
function getFileExtension(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    return ext || '.jpg';
}

export async function POST(request: NextRequest) {
    try {
        // 确保上传目录存在
        await ensureUploadsDir();

        // 获取上传的文件
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少文件',
                    message: '请选择要上传的图片文件',
                },
                { status: 400 }
            );
        }

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                {
                    success: false,
                    error: '无效的文件类型',
                    message: '只能上传图片文件',
                },
                { status: 400 }
            );
        }

        // 验证文件大小 (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    success: false,
                    error: '文件过大',
                    message: '图片大小不能超过5MB',
                },
                { status: 400 }
            );
        }

        // 生成唯一的文件名
        const fileExtension = getFileExtension(file.name);
        const uniqueFilename = `${randomBytes(16).toString('hex')}${fileExtension}`;
        const filePath = path.join(UPLOADS_DIR, uniqueFilename);

        // 将文件保存到磁盘
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await fs.writeFile(filePath, buffer);

        // 验证文件是否成功保存
        try {
            const stats = await fs.stat(filePath);
            console.log(`文件保存成功: ${filePath}, 大小: ${stats.size} bytes`);
        } catch (error) {
            console.error('文件保存验证失败:', error);
        }

        // 生成文件URL（使用 API 路由确保在生产环境中也能访问）
        // 优先使用 API 路由，这样在生产环境中也能正常工作
        const fileUrl = `/api/uploads/${uniqueFilename}`;
        console.log(`文件URL: ${fileUrl}, 完整路径: ${filePath}`);

        return NextResponse.json({
            success: true,
            url: fileUrl,
            message: '图片上传成功',
        });
    } catch (error: any) {
        console.error('上传图片失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '上传失败',
                message: error.message || '上传图片时发生错误',
            },
            { status: 500 }
        );
    }
}

