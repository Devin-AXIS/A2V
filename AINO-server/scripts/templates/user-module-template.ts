// 用户模块模板定义

import type { ModuleTemplate } from './types'

export const userModuleTemplate: ModuleTemplate = {
  name: '用户管理',
  description: '系统用户管理模块，包含用户列表目录和默认字段',
  directories: [
    {
      name: '用户列表',
      type: 'table',
      supportsCategory: false,
      categories: [
        {
          name: '基础信息',
          description: '用户基本信息',
          order: 1,
          system: true
        },
        {
          name: '用户履历',
          description: '用户经历和履历',
          order: 2,
          system: true
        },
        {
          name: '实名与认证',
          description: '身份认证信息',
          order: 3,
          system: true
        }
      ],
      fields: [
        // 基础信息 (10个字段)
        { key: 'avatar', label: '头像', type: 'profile', required: true, showInList: true, showInForm: true, category: '基础信息' },
        { key: 'name', label: '姓名', type: 'text', required: true, showInList: true, showInForm: true, category: '基础信息' },
        { key: 'email', label: '邮箱', type: 'text', required: false, showInList: true, showInForm: true, category: '基础信息' },
        { key: 'phone_number', label: '手机号', type: 'text', required: true, showInList: true, showInForm: true, category: '基础信息' },
        { key: 'gender', label: '性别', type: 'select', required: true, showInList: true, showInForm: true, options: ['男', '女', '其他'], category: '基础信息' },
        { key: 'birthday', label: '生日', type: 'date', required: false, showInList: true, showInForm: true, category: '基础信息' },
        { key: 'city', label: '居住城市', type: 'text', required: false, showInList: true, showInForm: true, category: '基础信息' },
        { key: 'industry', label: '行业', type: 'text', required: false, showInList: true, showInForm: true, category: '基础信息' },
        { key: 'occupation', label: '职业', type: 'text', required: false, showInList: true, showInForm: true, category: '基础信息' },
        { key: 'bio', label: '个人介绍', type: 'textarea', required: false, showInList: true, showInForm: true, category: '基础信息' },

        // 用户履历 (7个字段)
        { key: 'work_exp', label: '工作经历', type: 'experience', required: false, showInList: true, showInForm: true, category: '用户履历' },
        { key: 'edu_exp', label: '教育经历', type: 'experience', required: false, showInList: true, showInForm: true, category: '用户履历' },
        { key: 'proj_exp', label: '项目经历', type: 'experience', required: false, showInList: true, showInForm: true, category: '用户履历' },
        { key: 'honors', label: '荣誉证书', type: 'experience', required: false, showInList: true, showInForm: true, category: '用户履历' },
        { key: 'skills', label: '技能', type: 'multiselect', required: false, showInList: true, showInForm: true, category: '用户履历' },
        { key: 'zodiac_sign', label: '星座', type: 'select', required: false, showInList: true, showInForm: true, options: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'], category: '用户履历' },
        { key: 'user_id', label: '用户ID', type: 'text', required: false, showInList: true, showInForm: true, category: '用户履历' },

        // 实名与认证 (2个字段)
        { key: 'realname_status', label: '实名认证', type: 'identity_verification', required: false, showInList: true, showInForm: true, category: '实名与认证', preset: 'identity_verification' as any },
        { key: 'socid_status', label: '社会身份认证', type: 'other_verification', required: false, showInList: true, showInForm: true, category: '实名与认证', preset: 'other_verification' as any }
      ]
    }
  ]
}
