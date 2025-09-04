"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"

export default function AuthTestPage() {
    const params = useParams<{ appId: string }>()
    const applicationId = params?.appId

    const [registerForm, setRegisterForm] = useState({
        phone_number: "",
        password: "",
        name: "",
        email: "",
    })
    const [loginForm, setLoginForm] = useState({
        phone_number: "",
        password: "",
    })
    const [changePwdForm, setChangePwdForm] = useState({
        phone_number: "",
        old_password: "",
        new_password: "",
    })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string>("")
    const [loggedInUser, setLoggedInUser] = useState<any>(null)
    const [registerMsg, setRegisterMsg] = useState<string>("")
    const [registerMsgType, setRegisterMsgType] = useState<'success' | 'error' | ''>('')

    if (!applicationId) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold">Auth Test</h2>
                <p className="text-red-500 mt-2">Missing applicationId in route.</p>
            </div>
        )
    }

    const handleRegister = async () => {
        setLoading(true)
        setMessage("")
        setRegisterMsg("")
        setRegisterMsgType('')
        try {
            const payload: any = {
                phone_number: registerForm.phone_number,
                password: registerForm.password,
            }
            if (registerForm.name && registerForm.name.trim().length > 0) {
                payload.name = registerForm.name.trim()
            }
            if (registerForm.email && registerForm.email.trim().length > 0) {
                payload.email = registerForm.email.trim()
            }

            const res = await api.applicationUsers.registerUser(applicationId, payload)
            if (res.success) {
                setMessage("注册成功")
                setRegisterMsg("注册成功")
                setRegisterMsgType('success')
            } else {
                const msg = res.error || "注册失败"
                setMessage(msg)
                setRegisterMsg(msg)
                setRegisterMsgType('error')
            }
        } catch (e: any) {
            const msg = e?.message || "注册失败"
            setMessage(msg)
            setRegisterMsg(msg)
            setRegisterMsgType('error')
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async () => {
        setLoading(true)
        setMessage("")
        try {
            const res = await api.applicationUsers.loginUser(applicationId, loginForm)
            if (res.success) {
                setLoggedInUser(res.data)
                setMessage("登录成功")
            } else {
                setMessage(res.error || "登录失败")
            }
        } catch (e: any) {
            setMessage(e?.message || "登录失败")
        } finally {
            setLoading(false)
        }
    }

    const handleChangePassword = async () => {
        setLoading(true)
        setMessage("")
        try {
            const res = await api.applicationUsers.changePassword(applicationId, changePwdForm)
            if (res.success) {
                setMessage("修改密码成功")
            } else {
                setMessage(res.error || "修改密码失败")
            }
        } catch (e: any) {
            setMessage(e?.message || "修改密码失败")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold">应用用户注册/登录/改密测试</h1>
            <p className="text-sm text-muted-foreground">Application ID: {applicationId}</p>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">注册</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="手机号"
                        value={registerForm.phone_number}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone_number: e.target.value })}
                    />
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="密码"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="姓名（可选）"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    />
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="邮箱（可选）"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                </div>
                <button
                    onClick={handleRegister}
                    disabled={loading}
                    className="inline-flex items-center rounded px-4 py-2 bg-black text-white disabled:opacity-50"
                >
                    {loading ? "提交中..." : "注册"}
                </button>
                {registerMsg && (
                    <div className={`text-sm mt-2 ${registerMsgType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {registerMsg}
                    </div>
                )}
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">登录</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="手机号"
                        value={loginForm.phone_number}
                        onChange={(e) => setLoginForm({ ...loginForm, phone_number: e.target.value })}
                    />
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="密码"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                </div>
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="inline-flex items-center rounded px-4 py-2 bg-black text-white disabled:opacity-50"
                >
                    {loading ? "提交中..." : "登录"}
                </button>
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-semibold">修改密码</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="手机号"
                        value={changePwdForm.phone_number}
                        onChange={(e) => setChangePwdForm({ ...changePwdForm, phone_number: e.target.value })}
                    />
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="旧密码"
                        type="password"
                        value={changePwdForm.old_password}
                        onChange={(e) => setChangePwdForm({ ...changePwdForm, old_password: e.target.value })}
                    />
                    <input
                        className="border rounded px-3 py-2"
                        placeholder="新密码"
                        type="password"
                        value={changePwdForm.new_password}
                        onChange={(e) => setChangePwdForm({ ...changePwdForm, new_password: e.target.value })}
                    />
                </div>
                <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="inline-flex items-center rounded px-4 py-2 bg-black text-white disabled:opacity-50"
                >
                    {loading ? "提交中..." : "修改密码"}
                </button>
            </section>

            {message && (
                <div className="text-sm text-blue-600">{message}</div>
            )}

            {loggedInUser && (
                <section className="space-y-3">
                    <h2 className="text-lg font-semibold">登录后返回的用户信息</h2>
                    <div className="rounded border p-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <div className="flex flex-col items-center gap-3">
                            <img
                                src={loggedInUser.avatar || loggedInUser.profile?.avatar || "/placeholder-user.jpg"}
                                alt={loggedInUser.name || loggedInUser.profile?.name || "avatar"}
                                className="w-24 h-24 rounded-full object-cover border"
                            />
                            <div className="text-center">
                                <div className="text-base font-semibold">{loggedInUser.name || loggedInUser.profile?.name || '未命名用户'}</div>
                                <div className="text-xs text-muted-foreground">{loggedInUser.role || 'user'}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm"><span className="text-muted-foreground">手机号：</span>{loggedInUser.phone_number || loggedInUser.phone}</div>
                            <div className="text-sm"><span className="text-muted-foreground">邮箱：</span>{loggedInUser.email || loggedInUser.profile?.email || '-'}</div>
                            <div className="text-sm"><span className="text-muted-foreground">姓名：</span>{loggedInUser.name || loggedInUser.profile?.name || '-'}</div>
                            <div className="text-sm"><span className="text-muted-foreground">部门：</span>{loggedInUser.department || loggedInUser.profile?.department || '-'}</div>
                            <div className="text-sm"><span className="text-muted-foreground">职位：</span>{loggedInUser.position || loggedInUser.profile?.position || '-'}</div>
                            <div className="text-sm"><span className="text-muted-foreground">状态：</span>{loggedInUser.status || '-'}</div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium">标签</div>
                            <div className="flex flex-wrap gap-2">
                                {(loggedInUser.tags || loggedInUser.profile?.tags || []).map((t: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 text-xs rounded bg-gray-100 border">{t}</span>
                                ))}
                                {(!loggedInUser.tags || (loggedInUser.tags?.length || 0) === 0) && (!loggedInUser.profile?.tags || loggedInUser.profile.tags.length === 0) && (
                                    <span className="text-xs text-muted-foreground">无</span>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">用户ID：{loggedInUser.id}</div>
                            <div className="text-xs text-muted-foreground">应用ID：{applicationId}</div>
                        </div>
                    </div>

                    {/* 调试区：可折叠显示完整 JSON */}
                    <details className="rounded border p-3">
                        <summary className="cursor-pointer text-sm">查看完整返回 JSON</summary>
                        <pre className="mt-2 text-xs whitespace-pre-wrap break-all">{JSON.stringify(loggedInUser, null, 2)}</pre>
                    </details>
                </section>
            )}
        </div>
    )
}


