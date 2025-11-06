import { NextRequest, NextResponse } from 'next/server';
import { getProfileByAddress, upsertProfile, UserProfile } from '@/lib/database';

// GET: 根据钱包地址获取用户信息
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少钱包地址',
                    message: '请提供钱包地址参数',
                },
                { status: 400 }
            );
        }

        const profile = getProfileByAddress(address);

        if (!profile) {
            return NextResponse.json({
                success: true,
                profile: null,
                message: '未找到用户信息',
            });
        }

        // 返回用户信息（不包含地址）
        const { address: _, ...profileData } = profile;
        return NextResponse.json({
            success: true,
            profile: profileData,
            message: '获取用户信息成功',
        });
    } catch (error: any) {
        console.error('获取用户信息失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '获取失败',
                message: error.message || '获取用户信息时发生错误',
            },
            { status: 500 }
        );
    }
}

// POST: 保存或更新用户信息
export async function POST(request: NextRequest) {
    try {
        const { address, avatar, name, website, profession, bio } = await request.json();

        // 验证必填字段
        if (!address) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少钱包地址',
                    message: '钱包地址不能为空',
                },
                { status: 400 }
            );
        }

        if (!name || !name.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少必填字段',
                    message: '姓名不能为空',
                },
                { status: 400 }
            );
        }

        // 如果 avatar 是 base64 格式，需要转换（但新上传的应该已经是 URL）
        // 这里只保存 URL，不保存 base64
        let avatarUrl = avatar || '';
        if (avatar && avatar.startsWith('data:image')) {
            // 如果是 base64，忽略它（旧数据兼容，新上传应该已经是 URL）
            console.warn('收到 base64 格式的 avatar，已忽略。请使用文件上传 API 上传图片。');
            avatarUrl = '';
        }

        // 创建或更新用户信息
        const profile: UserProfile = {
            address: address.toLowerCase(),
            avatar: avatarUrl, // 保存图片 URL，而不是 base64
            name: name.trim(),
            website: website || '',
            profession: profession || '',
            bio: bio || '',
            updatedAt: new Date().toISOString(),
        };

        // 保存到数据库
        upsertProfile(profile);

        // 返回用户信息（不包含地址）
        const { address: _, ...profileData } = profile;
        return NextResponse.json({
            success: true,
            profile: profileData,
            message: '用户信息保存成功',
        });
    } catch (error: any) {
        console.error('保存用户信息失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '保存失败',
                message: error.message || '保存用户信息时发生错误',
            },
            { status: 500 }
        );
    }
}

