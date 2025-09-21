"use client"

import { useState, useMemo } from "react"
import { FrostPanel } from "@/components/frost"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Download, Edit, Building, UserCheck, SettingsIcon, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLocale } from "@/hooks/use-locale"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

// 引用公用组件
import { InviteMemberDialog } from "@/components/dialogs/invite-member-dialog"
import { AddRoleDialog } from "@/components/dialogs/add-role-dialog"
import { AddDepartmentDialog } from "@/components/dialogs/add-department-dialog"

interface Department {
  id: string
  name: string
  description: string
  memberCount: number
  leaderId?: string
  leaderName?: string
  createdAt: string
}

interface Member {
  id: string
  name: string
  email: string
  role: string
  department: string
  joinDate: string
  avatar?: string
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  memberCount: number
  isSystem: boolean
}

interface AuditLog {
  id: string
  action: string
  user: string
  time: string
  detail: string
}

export function TeamManagement() {
  const { toast } = useToast()
  const { locale } = useLocale()
  const [activeTab, setActiveTab] = useState("members")

  const [membersPage, setMembersPage] = useState(1)
  const [departmentsPage, setDepartmentsPage] = useState(1)
  const [rolesPage, setRolesPage] = useState(1)
  const [auditPage, setAuditPage] = useState(1)
  const pageSize = 10

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [addDeptDialogOpen, setAddDeptDialogOpen] = useState(false)
  const [editDeptDialogOpen, setEditDeptDialogOpen] = useState(false)
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false)
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false)
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false)

  // Selected items
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // Form states for edit dialogs
  const [deptForm, setDeptForm] = useState({ name: "", description: "", leaderId: "" })
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissions: [] as string[] })
  const [memberForm, setMemberForm] = useState({ role: "", department: "" })

  // Mock data
  const [departments, setDepartments] = useState<Department[]>([
    {
      id: "1",
      name: locale === "zh" ? "技术部" : "Technology",
      description: locale === "zh" ? "负责产品技术开发和维护" : "Responsible for product technology development and maintenance",
      memberCount: 8,
      leaderId: "1",
      leaderName: locale === "zh" ? "张三" : "Zhang San",
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      name: locale === "zh" ? "产品部" : "Product",
      description: locale === "zh" ? "负责产品规划和需求管理" : "Responsible for product planning and requirement management",
      memberCount: 5,
      leaderId: "2",
      leaderName: locale === "zh" ? "李四" : "Li Si",
      createdAt: "2024-01-01",
    },
  ])

  const [members, setMembers] = useState<Member[]>([
    {
      id: "1",
      name: "Owner",
      email: "owner@example.com",
      role: locale === "zh" ? "管理员" : "Administrator",
      department: locale === "zh" ? "技术部" : "Technology",
      joinDate: "2024-10-04",
    },
    {
      id: "2",
      name: "Alice",
      email: "alice@example.com",
      role: locale === "zh" ? "编辑者" : "Editor",
      department: locale === "zh" ? "产品部" : "Product",
      joinDate: "2024-10-05",
    },
    {
      id: "3",
      name: "Bob",
      email: "bob@example.com",
      role: locale === "zh" ? "查看者" : "Viewer",
      department: locale === "zh" ? "设计部" : "Design",
      joinDate: "2024-10-06",
    },
  ])

  const permissions: Permission[] = [
    { id: "view", name: locale === "zh" ? "查看" : "View", description: locale === "zh" ? "查看数据和内容" : "View data and content", category: locale === "zh" ? "基础权限" : "Basic Permissions" },
    { id: "create", name: locale === "zh" ? "创建" : "Create", description: locale === "zh" ? "创建新的数据和内容" : "Create new data and content", category: locale === "zh" ? "基础权限" : "Basic Permissions" },
    { id: "edit", name: locale === "zh" ? "编辑" : "Edit", description: locale === "zh" ? "编辑现有数据和内容" : "Edit existing data and content", category: locale === "zh" ? "基础权限" : "Basic Permissions" },
    { id: "delete", name: locale === "zh" ? "删除" : "Delete", description: locale === "zh" ? "删除数据和内容" : "Delete data and content", category: locale === "zh" ? "基础权限" : "Basic Permissions" },
    { id: "manage_users", name: locale === "zh" ? "用户管理" : "User Management", description: locale === "zh" ? "管理团队成员" : "Manage team members", category: locale === "zh" ? "管理权限" : "Management Permissions" },
    { id: "manage_roles", name: locale === "zh" ? "角色管理" : "Role Management", description: locale === "zh" ? "管理角色和权限" : "Manage roles and permissions", category: locale === "zh" ? "管理权限" : "Management Permissions" },
    { id: "system_settings", name: locale === "zh" ? "系统设置" : "System Settings", description: locale === "zh" ? "修改系统配置" : "Modify system configuration", category: locale === "zh" ? "管理权限" : "Management Permissions" },
    { id: "export_data", name: locale === "zh" ? "数据导出" : "Data Export", description: locale === "zh" ? "导出系统数据" : "Export system data", category: locale === "zh" ? "高级权限" : "Advanced Permissions" },
    { id: "api_access", name: locale === "zh" ? "API访问" : "API Access", description: locale === "zh" ? "使用API接口" : "Use API interfaces", category: locale === "zh" ? "高级权限" : "Advanced Permissions" },
  ]

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "admin",
      name: locale === "zh" ? "管理员" : "Administrator",
      description: locale === "zh" ? "拥有所有权限，可以管理整个系统" : "Has all permissions, can manage the entire system",
      permissions: [
        "view",
        "create",
        "edit",
        "delete",
        "manage_users",
        "manage_roles",
        "system_settings",
        "export_data",
        "api_access",
      ],
      memberCount: 1,
      isSystem: true,
    },
    {
      id: "editor",
      name: locale === "zh" ? "编辑者" : "Editor",
      description: locale === "zh" ? "可以查看、创建和编辑内容" : "Can view, create and edit content",
      permissions: ["view", "create", "edit", "export_data"],
      memberCount: 1,
      isSystem: true,
    },
    {
      id: "viewer",
      name: locale === "zh" ? "查看者" : "Viewer",
      description: locale === "zh" ? "只能查看内容，无法修改" : "Can only view content, cannot modify",
      permissions: ["view"],
      memberCount: 1,
      isSystem: true,
    },
  ])

  const auditLogs: AuditLog[] = [
    { id: "1", action: locale === "zh" ? "创建用户" : "Create User", user: "Admin", time: "2024-01-15 14:30", detail: locale === "zh" ? "创建用户 alice@example.com" : "Created user alice@example.com" },
    {
      id: "2",
      action: locale === "zh" ? "修改权限" : "Modify Permissions",
      user: "Admin",
      time: "2024-01-15 14:25",
      detail: locale === "zh" ? "将 john@example.com 权限修改为编辑者" : "Changed john@example.com permissions to Editor",
    },
    { id: "3", action: locale === "zh" ? "删除数据" : "Delete Data", user: "Alice", time: "2024-01-15 14:20", detail: locale === "zh" ? "删除产品记录 #1234" : "Deleted product record #1234" },
  ]

  const paginatedMembers = useMemo(() => {
    const startIndex = (membersPage - 1) * pageSize
    return members.slice(startIndex, startIndex + pageSize)
  }, [members, membersPage, pageSize])

  const paginatedDepartments = useMemo(() => {
    const startIndex = (departmentsPage - 1) * pageSize
    return departments.slice(startIndex, startIndex + pageSize)
  }, [departments, departmentsPage, pageSize])

  const paginatedRoles = useMemo(() => {
    const startIndex = (rolesPage - 1) * pageSize
    return roles.slice(startIndex, startIndex + pageSize)
  }, [roles, rolesPage, pageSize])

  const paginatedAuditLogs = useMemo(() => {
    const startIndex = (auditPage - 1) * pageSize
    return auditLogs.slice(startIndex, startIndex + pageSize)
  }, [auditLogs, auditPage, pageSize])

  const membersTotalPages = Math.ceil(members.length / pageSize)
  const departmentsTotalPages = Math.ceil(departments.length / pageSize)
  const rolesTotalPages = Math.ceil(roles.length / pageSize)
  const auditTotalPages = Math.ceil(auditLogs.length / pageSize)

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
    if (totalPages <= 1) return null

    const goToPage = (page: number) => {
      onPageChange(Math.max(1, Math.min(page, totalPages)))
    }

    return (
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
                className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => goToPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => goToPage(currentPage + 1)}
                className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  // Handler functions for public components
  const handleAddRole = (data: { name: string; description: string; permissions: string[] }) => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      permissions: data.permissions,
      memberCount: 0,
      isSystem: false,
    }

    setRoles([...roles, newRole])
    toast({ description: locale === "zh" ? "角色创建成功" : "Role created successfully" })
  }

  const handleAddDepartment = (data: { name: string; description: string; leaderId?: string }) => {
    const newDept: Department = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      memberCount: 0,
      leaderId: data.leaderId,
      leaderName: data.leaderId ? members.find((m) => m.id === data.leaderId)?.name : undefined,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setDepartments([...departments, newDept])
    toast({ description: locale === "zh" ? "部门创建成功" : "Department created successfully" })
  }

  // Department functions
  const handleEditDepartment = () => {
    if (!selectedDepartment) return

    setDepartments(
      departments.map((dept) =>
        dept.id === selectedDepartment.id
          ? {
              ...dept,
              name: deptForm.name,
              description: deptForm.description,
              leaderId: deptForm.leaderId || undefined,
              leaderName: deptForm.leaderId ? members.find((m) => m.id === deptForm.leaderId)?.name : undefined,
            }
          : dept,
      ),
    )
    setEditDeptDialogOpen(false)
    setSelectedDepartment(null)
    setDeptForm({ name: "", description: "", leaderId: "" })
    toast({ description: locale === "zh" ? "部门信息已更新" : "Department information updated" })
  }

  const handleDeleteDepartment = (deptId: string) => {
    setDepartments(departments.filter((dept) => dept.id !== deptId))
    toast({ description: locale === "zh" ? "部门已删除" : "Department deleted" })
  }

  // Role functions
  const handleEditRole = () => {
    if (!selectedRole) return

    setRoles(roles.map((role) => (role.id === selectedRole.id ? { ...role, permissions: roleForm.permissions } : role)))
    setEditRoleDialogOpen(false)
    setSelectedRole(null)
    setRoleForm({ name: "", description: "", permissions: [] })
    toast({ description: locale === "zh" ? "角色权限已更新" : "Role permissions updated" })
  }

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (role?.isSystem) {
      toast({ description: locale === "zh" ? "系统角色无法删除" : "System role cannot be deleted", variant: "destructive" })
      return
    }
    setRoles(roles.filter((role) => role.id !== roleId))
    toast({ description: locale === "zh" ? "角色已删除" : "Role deleted" })
  }

  // Member functions
  const handleEditMember = () => {
    if (!selectedMember) return

    setMembers(
      members.map((member) =>
        member.id === selectedMember.id
          ? {
              ...member,
              role: memberForm.role,
              department: memberForm.department,
            }
          : member,
      ),
    )
    setEditMemberDialogOpen(false)
    setSelectedMember(null)
    setMemberForm({ role: "", department: "" })
    toast({ description: locale === "zh" ? "成员信息已更新" : "Member information updated" })
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((member) => member.id !== memberId))
    toast({ description: locale === "zh" ? "成员已移除" : "Member removed" })
  }

  // Permission toggle function for edit role
  const togglePermission = (permissionId: string) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  // Group permissions by category
  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = []
      acc[perm.category].push(perm)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <FrostPanel>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{locale === "zh" ? "团队管理" : "Team Management"}</h1>
          <p className="text-sm text-slate-600 mt-1">{locale === "zh" ? "管理团队成员和权限" : "Manage team members and permissions"}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{locale === "zh" ? `共 ${members.length} 名成员` : `${members.length} members`}</span>
          <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="size-4 mr-2" />
            {locale === "zh" ? "邀请成员" : "Invite Member"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-slate-100/60 p-1 rounded-xl mb-6">
          <TabsTrigger value="members" className="rounded-lg text-sm data-[state=active]:bg-white">
            {locale === "zh" ? "成员" : "Members"}
          </TabsTrigger>
          <TabsTrigger value="departments" className="rounded-lg text-sm data-[state=active]:bg-white">
            {locale === "zh" ? "部门" : "Departments"}
          </TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-lg text-sm data-[state=active]:bg-white">
            {locale === "zh" ? "权限" : "Permissions"}
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg text-sm data-[state=active]:bg-white">
            {locale === "zh" ? "审计" : "Audit"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Input placeholder={locale === "zh" ? "搜索成员" : "Search members"} className="max-w-xs h-9" />
            <Select>
              <SelectTrigger className="w-28 h-9">
                <SelectValue placeholder={locale === "zh" ? "全部" : "All"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{locale === "zh" ? "全部" : "All"}</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {members.length > pageSize && (
            <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
              <div>
                {locale === "zh" ? `显示第 ${(membersPage - 1) * pageSize + 1}-${Math.min(membersPage * pageSize, members.length)} 条，共 ${members.length} 条记录` : `Showing ${(membersPage - 1) * pageSize + 1}-${Math.min(membersPage * pageSize, members.length)} of ${members.length} records`}
              </div>
              <div>
                {locale === "zh" ? `第 ${membersPage} 页，共 ${membersTotalPages} 页` : `Page ${membersPage} of ${membersTotalPages}`}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-white/60 overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-3 border-b bg-slate-50/60 text-sm font-medium text-slate-700">
              <div>{locale === "zh" ? "用户名" : "Username"}</div>
              <div>{locale === "zh" ? "邮箱" : "Email"}</div>
              <div>{locale === "zh" ? "角色" : "Role"}</div>
              <div>{locale === "zh" ? "部门" : "Department"}</div>
              <div>{locale === "zh" ? "加入时间" : "Join Date"}</div>
              <div>{locale === "zh" ? "操作" : "Actions"}</div>
            </div>
            {paginatedMembers.map((member) => (
              <div key={member.id} className="grid grid-cols-6 gap-4 p-3 border-b last:border-b-0 items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src="/generic-user-avatar.png" />
                    <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600 truncate">{member.email}</div>
                <div>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
                <div className="text-sm text-slate-600">{member.department}</div>
                <div className="text-sm text-slate-600">{member.joinDate}</div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 bg-transparent"
                    onClick={() => {
                      setSelectedMember(member)
                      setMemberForm({ role: member.role, department: member.department })
                      setEditMemberDialogOpen(true)
                    }}
                  >
                    <Edit className="size-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600 bg-transparent">
                        <Trash2 className="size-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{locale === "zh" ? "确认移除成员" : "Confirm Remove Member"}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {locale === "zh" ? `确定要移除成员 ${member.name} 吗？此操作无法撤销。` : `Are you sure you want to remove member ${member.name}? This action cannot be undone.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{locale === "zh" ? "取消" : "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveMember(member.id)}>{locale === "zh" ? "确认移除" : "Confirm Remove"}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>

          {renderPagination(membersPage, membersTotalPages, setMembersPage)}
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">{locale === "zh" ? "部门管理" : "Department Management"}</h3>
            <Button size="sm" onClick={() => setAddDeptDialogOpen(true)}>
              <Plus className="size-4 mr-2" />
              {locale === "zh" ? "添加部门" : "Add Department"}
            </Button>
          </div>

          {departments.length > pageSize && (
            <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
              <div>
                {locale === "zh" ? `显示第 ${(departmentsPage - 1) * pageSize + 1}-${Math.min(departmentsPage * pageSize, departments.length)} 条，共 ${departments.length} 条记录` : `Showing ${(departmentsPage - 1) * pageSize + 1}-${Math.min(departmentsPage * pageSize, departments.length)} of ${departments.length} records`}
              </div>
              <div>
                {locale === "zh" ? `第 ${departmentsPage} 页，共 ${departmentsTotalPages} 页` : `Page ${departmentsPage} of ${departmentsTotalPages}`}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedDepartments.map((dept) => (
              <Card key={dept.id} className="bg-white/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building className="size-4" />
                      {dept.name}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setSelectedDepartment(dept)
                          setDeptForm({
                            name: dept.name,
                            description: dept.description,
                            leaderId: dept.leaderId || "",
                          })
                          setEditDeptDialogOpen(true)
                        }}
                      >
                        <Edit className="size-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600">
                            <Trash2 className="size-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{locale === "zh" ? "确认删除部门" : "Confirm Delete Department"}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {locale === "zh" ? `确定要删除部门 "${dept.name}" 吗？此操作无法撤销。` : `Are you sure you want to delete department "${dept.name}"? This action cannot be undone.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{locale === "zh" ? "取消" : "Cancel"}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteDepartment(dept.id)}>
                              {locale === "zh" ? "确认删除" : "Confirm Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <CardDescription className="text-xs">{dept.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{locale === "zh" ? "成员数量" : "Member Count"}</span>
                      <Badge variant="secondary" className="text-xs">
                        {locale === "zh" ? `${dept.memberCount} 人` : `${dept.memberCount} members`}
                      </Badge>
                    </div>
                    {dept.leaderName && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{locale === "zh" ? "负责人" : "Leader"}</span>
                        <span className="font-medium">{dept.leaderName}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {renderPagination(departmentsPage, departmentsTotalPages, setDepartmentsPage)}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">{locale === "zh" ? "权限配置" : "Permission Configuration"}</h3>
            <Button size="sm" onClick={() => setAddRoleDialogOpen(true)}>
              <Plus className="size-4 mr-2" />
              {locale === "zh" ? "添加角色" : "Add Role"}
            </Button>
          </div>

          {roles.length > pageSize && (
            <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
              <div>
                {locale === "zh" ? `显示第 ${(rolesPage - 1) * pageSize + 1}-${Math.min(rolesPage * pageSize, roles.length)} 条，共 ${roles.length} 条记录` : `Showing ${(rolesPage - 1) * pageSize + 1}-${Math.min(rolesPage * pageSize, roles.length)} of ${roles.length} records`}
              </div>
              <div>
                {locale === "zh" ? `第 ${rolesPage} 页，共 ${rolesTotalPages} 页` : `Page ${rolesPage} of ${rolesTotalPages}`}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {paginatedRoles.map((role) => (
              <Card key={role.id} className="bg-white/60">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <UserCheck className="size-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">{role.name}</CardTitle>
                        <CardDescription className="text-xs">{role.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {locale === "zh" ? `${role.memberCount} 名成员` : `${role.memberCount} members`}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 bg-transparent"
                        onClick={() => {
                          setSelectedRole(role)
                          setRoleForm({
                            name: role.name,
                            description: role.description,
                            permissions: [...role.permissions],
                          })
                          setEditRoleDialogOpen(true)
                        }}
                      >
                        <SettingsIcon className="size-3" />
                      </Button>
                      {!role.isSystem && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-red-600 bg-transparent">
                              <Trash2 className="size-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{locale === "zh" ? "确认删除角色" : "Confirm Delete Role"}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {locale === "zh" ? `确定要删除角色 "${role.name}" 吗？此操作无法撤销。` : `Are you sure you want to delete role "${role.name}"? This action cannot be undone.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{locale === "zh" ? "取消" : "Cancel"}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRole(role.id)}>{locale === "zh" ? "确认删除" : "Confirm Delete"}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div>
                    <h4 className="text-xs font-medium mb-2">{locale === "zh" ? "权限列表" : "Permission List"}</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 4).map((permId) => {
                        const perm = permissions.find((p) => p.id === permId)
                        return perm ? (
                          <Badge key={permId} variant="outline" className="text-xs px-2 py-0.5">
                            {perm.name}
                          </Badge>
                        ) : null
                      })}
                      {role.permissions.length > 4 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{role.permissions.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {renderPagination(rolesPage, rolesTotalPages, setRolesPage)}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">{locale === "zh" ? "审计日志" : "Audit Logs"}</h3>
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              {locale === "zh" ? "导出日志" : "Export Logs"}
            </Button>
          </div>

          {auditLogs.length > pageSize && (
            <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
              <div>
                {locale === "zh" ? `显示第 ${(auditPage - 1) * pageSize + 1}-${Math.min(auditPage * pageSize, auditLogs.length)} 条，共 ${auditLogs.length} 条记录` : `Showing ${(auditPage - 1) * pageSize + 1}-${Math.min(auditPage * pageSize, auditLogs.length)} of ${auditLogs.length} records`}
              </div>
              <div>
                {locale === "zh" ? `第 ${auditPage} 页，共 ${auditTotalPages} 页` : `Page ${auditPage} of ${auditTotalPages}`}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-white/60 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 p-3 border-b bg-slate-50/60 text-sm font-medium text-slate-700">
              <div>{locale === "zh" ? "操作" : "Action"}</div>
              <div>{locale === "zh" ? "用户" : "User"}</div>
              <div>{locale === "zh" ? "时间" : "Time"}</div>
              <div>{locale === "zh" ? "详情" : "Details"}</div>
            </div>
            {paginatedAuditLogs.map((log) => (
              <div key={log.id} className="grid grid-cols-4 gap-4 p-3 border-b last:border-b-0 text-sm">
                <div className="font-medium">{log.action}</div>
                <div className="text-slate-600">{log.user}</div>
                <div className="text-slate-600">{log.time}</div>
                <div className="text-slate-600 truncate">{log.detail}</div>
              </div>
            ))}
          </div>

          {renderPagination(auditPage, auditTotalPages, setAuditPage)}
        </TabsContent>
      </Tabs>

      {/* 使用公用组件 */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        roles={roles}
        departments={departments}
      />

      <AddDepartmentDialog
        open={addDeptDialogOpen}
        onOpenChange={setAddDeptDialogOpen}
        members={members}
        onAddDepartment={handleAddDepartment}
      />

      <AddRoleDialog
        open={addRoleDialogOpen}
        onOpenChange={setAddRoleDialogOpen}
        permissions={permissions}
        onAddRole={handleAddRole}
      />

      {/* Edit Department Dialog - 保留内联，因为是编辑功能 */}
      <Dialog open={editDeptDialogOpen} onOpenChange={setEditDeptDialogOpen}>
        <DialogContent className="bg-white/70 backdrop-blur border-white/60" aria-describedby="edit-dept-description">
                  <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="size-5" />
            {locale === "zh" ? "编辑部门" : "Edit Department"}
          </DialogTitle>
          <DialogDescription id="edit-dept-description">{locale === "zh" ? "修改部门信息" : "Modify department information"}</DialogDescription>
        </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{locale === "zh" ? "部门名称 *" : "Department Name *"}</Label>
              <Input
                placeholder={locale === "zh" ? "输入部门名称" : "Enter department name"}
                value={deptForm.name}
                onChange={(e) => setDeptForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "zh" ? "部门描述" : "Department Description"}</Label>
              <Input
                placeholder={locale === "zh" ? "输入部门描述" : "Enter department description"}
                value={deptForm.description}
                onChange={(e) => setDeptForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "zh" ? "部门负责人" : "Department Leader"}</Label>
              <Select
                value={deptForm.leaderId || "none"} // Updated to ensure non-empty string value
                onValueChange={(value) => setDeptForm((prev) => ({ ...prev, leaderId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={locale === "zh" ? "选择负责人" : "Select leader"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{locale === "zh" ? "无负责人" : "No leader"}</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDeptDialogOpen(false)}>
              {locale === "zh" ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleEditDepartment}>{locale === "zh" ? "保存更改" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog - 保留内联，因为是编辑功能 */}
      <Dialog open={editRoleDialogOpen} onOpenChange={setEditRoleDialogOpen}>
        <DialogContent
          className="max-w-2xl bg-white/70 backdrop-blur border-white/60"
          aria-describedby="edit-role-description"
        >
                  <DialogHeader>
          <DialogTitle>{locale === "zh" ? "编辑角色权限" : "Edit Role Permissions"}</DialogTitle>
          <DialogDescription id="edit-role-description">{locale === "zh" ? "修改角色的权限配置" : "Modify role permission configuration"}</DialogDescription>
        </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50/60 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserCheck className="size-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedRole.name}</h3>
                  <p className="text-sm text-slate-600">{selectedRole.description}</p>
                </div>
              </div>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                <Label>{locale === "zh" ? "权限配置" : "Permission Configuration"}</Label>
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-${perm.id}`}
                            checked={roleForm.permissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                                                  <Label htmlFor={`edit-${perm.id}`} className="text-sm">
                          {perm.name === "查看" ? (locale === "zh" ? "查看" : "View") :
                           perm.name === "创建" ? (locale === "zh" ? "创建" : "Create") :
                           perm.name === "编辑" ? (locale === "zh" ? "编辑" : "Edit") :
                           perm.name === "删除" ? (locale === "zh" ? "删除" : "Delete") :
                           perm.name === "用户管理" ? (locale === "zh" ? "用户管理" : "User Management") :
                           perm.name === "角色管理" ? (locale === "zh" ? "角色管理" : "Role Management") :
                           perm.name === "系统设置" ? (locale === "zh" ? "系统设置" : "System Settings") :
                           perm.name === "数据导出" ? (locale === "zh" ? "数据导出" : "Data Export") :
                           perm.name === "API访问" ? (locale === "zh" ? "API访问" : "API Access") : perm.name}
                        </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleDialogOpen(false)}>
              {locale === "zh" ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleEditRole}>{locale === "zh" ? "保存更改" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog - 保留内联，因为是编辑功能 */}
      <Dialog open={editMemberDialogOpen} onOpenChange={setEditMemberDialogOpen}>
        <DialogContent className="bg-white/70 backdrop-blur border-white/60" aria-describedby="edit-member-description">
                  <DialogHeader>
          <DialogTitle>{locale === "zh" ? "编辑成员信息" : "Edit Member Information"}</DialogTitle>
          <DialogDescription id="edit-member-description">{locale === "zh" ? "修改成员的角色和部门" : "Modify member's role and department"}</DialogDescription>
        </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src="/generic-user-avatar.png" />
                  <AvatarFallback>{selectedMember.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedMember.name}</div>
                  <div className="text-sm text-slate-600">{selectedMember.email}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{locale === "zh" ? "角色" : "Role"}</Label>
                <Select
                  value={memberForm.role}
                  onValueChange={(value) => setMemberForm((prev) => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{locale === "zh" ? "部门" : "Department"}</Label>
                <Select
                  value={memberForm.department}
                  onValueChange={(value) => setMemberForm((prev) => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{locale === "zh" ? "无部门" : "No department"}</SelectItem> {/* Updated to ensure non-empty string value */}
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMemberDialogOpen(false)}>
              {locale === "zh" ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleEditMember}>{locale === "zh" ? "保存更改" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FrostPanel>
  )
}
