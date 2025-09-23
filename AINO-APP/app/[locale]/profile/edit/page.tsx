"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import axios from "axios"
import { AppHeader } from "@/components/navigation/app-header"
import { DynamicBackground } from "@/components/theme/dynamic-background"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"
import {
  BasicInfoCard,
  GenericFormCard,
  jobExpectationFields,
  jobExpectationDisplay,
  educationFields,
  educationDisplay,
  workExperienceFields,
  workExperienceDisplay,
  projectFields,
  projectDisplay,
  certificateFields,
  certificateDisplay,
  type BasicInfo,
  type DataItem
} from "@/components/card/cards/user/profile-cards"
import { TagInput } from "@/components/input/tag-input"
import {
  User,
  Camera,
  Check,
  X,
  ChevronRight,
  Shield,
  Smartphone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Star,
  Plus,
  Edit,
  Eye
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"


export default function EditProfilePage() {
  const router = useRouter()
  const { locale } = useParams()
  const { toast } = useToast()

  const { user, isAuthenticated, isLoading } = useAuth()

  // 基础资料
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: user?.name || "",
    avatar: user?.avatar || "/generic-user-avatar.png",
    gender: user?.extends?.gender || "男",
    country: "CN",
    city: user?.extends?.city || "北京 - 朝阳区",
    birthday: user?.extends?.birthday || "1990-05-15",
    bio: user?.extends?.bio || "热爱技术，专注于前端开发",
    profession: user?.extends?.profession || "前端工程师"
  });

  // 其他档案数据
  const [userProfile, setUserProfile] = useState({
    // 联系信息
    phone: "176******38",
    phoneVerified: true,
    email: "wangyu@example.com",
    emailVerified: false,


    // 个人优势
    personalAdvantages: "很傻",

    // 求职期望
    jobExpectations: [] as DataItem[],

    // 工作经历
    workExperience: user?.extends?.work_exp || [] as DataItem[],

    // 项目经历
    projectExperience: user?.extends?.proj_exp || [] as DataItem[],

    // 教育经历
    educationHistory: user?.extends?.edu_exp || [] as DataItem[],

    // 证书资质
    certificates: user?.extends?.honors || [] as DataItem[],

    // 个人技能
    skills: user?.extends?.skills || [] as string[],

  })

  useEffect(() => {
    setBasicInfo({
      name: user?.name || "",
      avatar: user?.avatar || "/generic-user-avatar.png",
      gender: user?.extends?.gender || "男",
      country: "CN",
      city: user?.extends?.city || "北京 - 朝阳区",
      birthday: user?.extends?.birthday || "1990-05-15",
      bio: user?.extends?.bio || "热爱技术，专注于前端开发",
      profession: user?.extends?.profession || "前端工程师"
    })

    // work_exp
    // proj_exp
    // edu_exp
    // honors

    setUserProfile({
      ...userProfile,
      workExperience: user?.extends?.work_exp || [] as DataItem[],
      projectExperience: user?.extends?.proj_exp || [] as DataItem[],
      educationHistory: user?.extends?.edu_exp || [] as DataItem[],
      certificates: user?.extends?.honors || [] as DataItem[],
      skills: user?.extends?.skills || [] as string[],
    })
  }, [user])

  const [showContactEdit, setShowContactEdit] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [skillsMode, setSkillsMode] = useState<'view' | 'edit'>('view')

  // 保存档案
  const handleSaveProfile = () => {
    console.log("保存档案:", userProfile)
    router.back()
  }


  // 编辑项组件
  const EditableItem = ({
    icon,
    title,
    content,
    action = "编辑",
    onClick,
    showArrow = true,
    status,
    isOptimizable = false
  }: {
    icon: React.ReactNode
    title: string
    content: string | React.ReactNode
    action?: string
    onClick: () => void
    showArrow?: boolean
    status?: 'verified' | 'unverified' | 'incomplete'
    isOptimizable?: boolean
  }) => (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors rounded-xl"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>{title}</p>
            {isOptimizable && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                待优化
              </span>
            )}
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--card-text-color)" }}>
            {content}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === 'verified' && (
          <Shield className="w-4 h-4" style={{ color: "var(--card-success-color, #22c55e)" }} />
        )}
        {status === 'incomplete' && (
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--card-warning-color, #f59e0b)" }} />
        )}

        <PillButton variant="default">
          {action}
        </PillButton>

        {showArrow && (
          <ChevronRight className="w-4 h-4" style={{ color: "var(--card-text-color)" }} />
        )}
      </div>
    </div>
  )

  // 添加项组件
  const AddSection = ({ title, onClick }: { title: string; onClick: () => void }) => (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors rounded-xl border-2 border-dashed"
      style={{ borderColor: "var(--card-border-color, #e2e8f0)" }}
    >
      <span className="text-sm font-medium" style={{ color: "var(--card-title-color)" }}>{title}</span>
      <Plus className="w-5 h-5" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
    </div>
  )

  const handleWorkUpdate = (workExperience: DataItem[]) => {
    // (workExperience) => setUserProfile(prev => ({ ...prev, workExperience }))
    workExperience.forEach((item, index) => {
      const { id, title, organization, description, department, salary, startDate, endDate, isCurrent, isCurrently } = item;
      const currentWorkExp = user?.extends?.work_exp?.find((exp) => exp.id === id);
      if (currentWorkExp) {
        currentWorkExp.title = title;
        currentWorkExp.organization = organization;
        currentWorkExp.description = description;
        currentWorkExp.department = department;
        currentWorkExp.salary = salary;
        currentWorkExp.startDate = startDate;
        currentWorkExp.endDate = endDate;
        currentWorkExp.isCurrent = isCurrent;
        currentWorkExp.isCurrently = isCurrently;
      }
    })
    handleSaveUserData("work_exp");
  }

  const handleProjectUpdate = (projectExperience: DataItem[]) => {
    // (workExperience) => setUserProfile(prev => ({ ...prev, workExperience }))
    projectExperience.forEach((item, index) => {
      const { id, title, organization, description, department, technologies, startDate, endDate, isCurrent, isOngoing } = item;
      const currentWorkExp = user?.extends?.proj_exp?.find((exp) => exp.id === id);
      if (currentWorkExp) {
        currentWorkExp.title = title;
        currentWorkExp.organization = organization;
        currentWorkExp.description = description;
        currentWorkExp.department = department;
        currentWorkExp.technologies = technologies;
        currentWorkExp.startDate = startDate;
        currentWorkExp.endDate = endDate;
        currentWorkExp.isCurrent = isCurrent;
        currentWorkExp.isOngoing = isOngoing;
      }
    })
    handleSaveUserData("proj_exp");
  }

  const handleEducationUpdate = (educationHistory: DataItem[]) => {
    // (workExperience) => setUserProfile(prev => ({ ...prev, workExperience }))
    educationHistory.forEach((item, index) => {
      const { id, title, organization, description, degree, startDate, endDate, isCurrent, isCurrently } = item;
      const currentWorkExp = user?.extends?.edu_exp?.find((exp) => exp.id === id);
      if (currentWorkExp) {
        currentWorkExp.title = title;
        currentWorkExp.organization = organization;
        currentWorkExp.description = description;
        currentWorkExp.degree = degree;
        currentWorkExp.startDate = startDate;
        currentWorkExp.endDate = endDate;
        currentWorkExp.isCurrent = isCurrent;
        currentWorkExp.isCurrently = isCurrently;
      }
    })
    handleSaveUserData("edu_exp");
  }

  const handleCertificateUpdate = (certificates: DataItem[]) => {
    // (workExperience) => setUserProfile(prev => ({ ...prev, workExperience }))
    certificates.forEach((item, index) => {
      const { id, title, organization, description, credentialId, issueDate, expiryDate, isCurrent, isNeverExpires } = item;
      const currentWorkExp = user?.extends?.honors?.find((exp) => exp.id === id);
      if (currentWorkExp) {
        currentWorkExp.title = title;
        currentWorkExp.organization = organization;
        currentWorkExp.description = description;
        currentWorkExp.credentialId = credentialId;
        currentWorkExp.issueDate = issueDate;
        currentWorkExp.expiryDate = expiryDate;
        currentWorkExp.isNeverExpires = isNeverExpires;
        currentWorkExp.isCurrent = isCurrent;
      }
    })
    handleSaveUserData("honors");
  }

  const handleSkillsUpdate = (skills: string[]) => {
    console.log(skills, 23232323)
    handleSaveUserData("skills");
    // (skills) => setUserProfile(prev => ({ ...prev, skills }))
  }

  const handleSaveUserData = async (type: string) => {
    const scopedKey = user?.extends?.applicationId ? `aino_auth_token:${user?.extends?.applicationId}` : null
    const token =
      (scopedKey ? window.localStorage.getItem(scopedKey) : null)
      || window.localStorage.getItem('aino_auth_token')
      || window.localStorage.getItem('aino_token')
      || ''

    const body = { props: { [type]: user.extends[type] } };
    // const body = { [type]: user.extends[type] };
    const res = await axios.patch(
      `http://localhost:3007/api/records/${user.extends.__dirId}/${user.extends.recordId}`,
      body,
      {
        headers: {
          "Authorization": `Bearer ${token}`
        },
      })
    const data = await res.json()
    if (!res.ok || !data?.success || !data?.url) {
      toast({
        title: "更新失败",
        description: data?.message || "更新失败,请重试.",
        variant: "destructive"
      })
    } else {
      toast({
        title: "更新成功",
        description: "用户信息已更新"
      })
    }
  }

  return (
    <div className="min-h-screen pb-32">
      <DynamicBackground />
      <AppHeader title="我的在线简历" showBackButton />

      <div className="px-4 py-6 space-y-4 pt-20">

        {/* 简历专业评分卡片 */}
        {/* <AppCard>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--card-accent-color, #3b82f6)" }}>
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: "var(--card-title-color)" }}>
                    简历专业评分 <span className="text-2xl" style={{ color: "var(--card-accent-color, #3b82f6)" }}>76</span>分
                  </p>
                  <p className="text-xs" style={{ color: "var(--card-text-color)" }}>
                    简历完整度良好
                  </p>
                </div>
              </div>
              <PillButton variant="default">
                去查看
              </PillButton>
            </div>
          </div>
        </AppCard> */}

        {/* 基础资料 */}
        <BasicInfoCard
          basicInfo={basicInfo}
          onUpdate={setBasicInfo}
        />


        {/* 个人优势 */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold" style={{ color: "var(--card-title-color)" }}>个人优势</h3>
              <Edit className="w-4 h-4" style={{ color: "var(--card-accent-color, #3b82f6)" }} />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--card-warning-color, #f59e0b)" }}>
                <span className="text-xs text-white">!</span>
              </div>
              <span className="text-sm" style={{ color: "var(--card-warning-color, #f59e0b)" }}>补充你的优势信息</span>
            </div>

            <p className="text-sm" style={{ color: "var(--card-text-color)" }}>
              {userProfile.personalAdvantages}
            </p>
          </div>
        </AppCard>

        {/* 求职期望 */}
        {/* <GenericFormCard
          title="求职期望"
          data={userProfile.jobExpectations}
          onUpdate={(jobExpectations) => setUserProfile(prev => ({ ...prev, jobExpectations }))}
          fields={jobExpectationFields}
          displayConfig={jobExpectationDisplay}
          allowMultiple={false}
          emptyText="暂未设置求职期望"
          addButtonText="设置期望"
        /> */}

        {/* 工作经历 */}
        <GenericFormCard
          title="工作经历"
          data={userProfile.workExperience}
          onUpdate={handleWorkUpdate}
          fields={workExperienceFields}
          displayConfig={workExperienceDisplay}
          allowMultiple={true}
          emptyText="暂无工作经历"
          addButtonText="添加工作经历"
        />

        {/* 项目经历 */}
        <GenericFormCard
          title="项目经历"
          data={userProfile.projectExperience}
          onUpdate={handleProjectUpdate}
          fields={projectFields}
          displayConfig={projectDisplay}
          allowMultiple={true}
          emptyText="暂无项目经历"
          addButtonText="添加项目经历"
        />

        {/* 教育经历 */}
        <GenericFormCard
          title="教育经历"
          data={userProfile.educationHistory}
          onUpdate={handleEducationUpdate}
          fields={educationFields}
          displayConfig={educationDisplay}
          allowMultiple={true}
          emptyText="暂无教育经历"
          addButtonText="添加教育经历"
        />

        {/* 证书资质 */}
        <GenericFormCard
          title="证书资质"
          data={userProfile.certificates}
          onUpdate={handleCertificateUpdate}
          fields={certificateFields}
          displayConfig={certificateDisplay}
          allowMultiple={true}
          emptyText="暂无证书资质"
          addButtonText="添加证书"
        />

        {/* 个人技能 */}
        <AppCard>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: "var(--card-title-color)" }}>个人技能</h3>
              <div className="text-xs" style={{ color: "var(--card-text-color)" }}>
                {userProfile.skills.length} 个技能
              </div>
            </div>

            <TagInput
              value={userProfile.skills}
              onChange={handleSkillsUpdate}
              placeholder="输入技能后按回车添加"
              maxTags={20}
              emptyText="暂未添加技能标签"
              mode={skillsMode}
              onModeChange={setSkillsMode}
            />
          </div>
        </AppCard>

        {/* 预览按钮 */}
        <AppCard>
          <div className="p-4">
            <PillButton
              className="w-full flex items-center justify-center gap-2"
              onClick={() => console.log("预览简历")}
            >
              <Eye className="w-4 h-4" />
              生成附件简历
            </PillButton>
          </div>
        </AppCard>
      </div>

      {/* 底部安全距离 */}
      <div className="h-20"></div>


      {/* 联系方式编辑弹窗 */}
      <BottomDrawer
        isOpen={showContactEdit}
        onClose={() => setShowContactEdit(false)}
        title="编辑联系方式"
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">手机号</label>
            <Input
              value={userProfile.phone}
              onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="请输入手机号"
              className="rounded-xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">邮箱</label>
            <Input
              value={userProfile.email}
              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="请输入邮箱地址"
              className="rounded-xl"
              type="email"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <PillButton
              variant="default"
              onClick={() => setShowContactEdit(false)}
              className="flex-1"
            >
              取消
            </PillButton>
            <PillButton
              onClick={() => setShowContactEdit(false)}
              className="flex-1"
            >
              确认
            </PillButton>
          </div>
        </div>
      </BottomDrawer>

    </div>
  )
}