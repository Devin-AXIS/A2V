import { getDictionary, type Locale } from "@/lib/dictionaries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Heart, Download, Share2, Settings, User, Mail, Phone, MapPin, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

export default async function PCBasicComponentsPage({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          {dict.mainPage.basic}
        </h1>
        <p className="text-gray-600">
          {locale === 'zh' 
            ? "基础UI组件展示，包括按钮、输入框、标签、进度条等常用组件" 
            : "Basic UI components showcase, including buttons, inputs, badges, progress bars and other common components"
          }
        </p>
      </div>

      {/* 按钮组件 */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/40">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {locale === 'zh' ? "按钮组件" : "Button Components"}
          </CardTitle>
          <CardDescription>
            {locale === 'zh' ? "各种样式和状态的按钮" : "Buttons with various styles and states"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              {locale === 'zh' ? "基础按钮" : "Basic Buttons"}
            </h4>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">
                {locale === 'zh' ? "主要按钮" : "Primary"}
              </Button>
              <Button variant="secondary">
                {locale === 'zh' ? "次要按钮" : "Secondary"}
              </Button>
              <Button variant="outline">
                {locale === 'zh' ? "边框按钮" : "Outline"}
              </Button>
              <Button variant="ghost">
                {locale === 'zh' ? "幽灵按钮" : "Ghost"}
              </Button>
              <Button variant="destructive">
                {locale === 'zh' ? "危险按钮" : "Destructive"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              {locale === 'zh' ? "带图标按钮" : "Icon Buttons"}
            </h4>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Star className="w-4 h-4 mr-2" />
                {locale === 'zh' ? "收藏" : "Favorite"}
              </Button>
              <Button variant="outline">
                <Heart className="w-4 h-4 mr-2" />
                {locale === 'zh' ? "喜欢" : "Like"}
              </Button>
              <Button variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                {locale === 'zh' ? "下载" : "Download"}
              </Button>
              <Button variant="ghost">
                <Share2 className="w-4 h-4 mr-2" />
                {locale === 'zh' ? "分享" : "Share"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              {locale === 'zh' ? "按钮尺寸" : "Button Sizes"}
            </h4>
            <div className="flex items-center gap-3">
              <Button size="sm">
                {locale === 'zh' ? "小按钮" : "Small"}
              </Button>
              <Button size="default">
                {locale === 'zh' ? "默认按钮" : "Default"}
              </Button>
              <Button size="lg">
                {locale === 'zh' ? "大按钮" : "Large"}
              </Button>
              <Button size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 输入框组件 */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/40">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {locale === 'zh' ? "输入框组件" : "Input Components"}
          </CardTitle>
          <CardDescription>
            {locale === 'zh' ? "各种类型的输入框" : "Various types of input fields"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {locale === 'zh' ? "用户名" : "Username"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder={locale === 'zh' ? "请输入用户名" : "Enter username"} 
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {locale === 'zh' ? "邮箱地址" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  type="email" 
                  placeholder={locale === 'zh' ? "请输入邮箱地址" : "Enter email address"} 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {locale === 'zh' ? "电话号码" : "Phone Number"}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder={locale === 'zh' ? "请输入电话号码" : "Enter phone number"} 
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {locale === 'zh' ? "地址" : "Address"}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder={locale === 'zh' ? "请输入地址" : "Enter address"} 
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 标签组件 */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/40">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {locale === 'zh' ? "标签组件" : "Badge Components"}
          </CardTitle>
          <CardDescription>
            {locale === 'zh' ? "各种样式的标签和状态指示器" : "Various styles of badges and status indicators"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              {locale === 'zh' ? "基础标签" : "Basic Badges"}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">
                {locale === 'zh' ? "默认" : "Default"}
              </Badge>
              <Badge variant="secondary">
                {locale === 'zh' ? "次要" : "Secondary"}
              </Badge>
              <Badge variant="outline">
                {locale === 'zh' ? "边框" : "Outline"}
              </Badge>
              <Badge variant="destructive">
                {locale === 'zh' ? "危险" : "Destructive"}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              {locale === 'zh' ? "状态标签" : "Status Badges"}
            </h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                {locale === 'zh' ? "成功" : "Success"}
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                {locale === 'zh' ? "警告" : "Warning"}
              </Badge>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                <XCircle className="w-3 h-3 mr-1" />
                {locale === 'zh' ? "错误" : "Error"}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                <Calendar className="w-3 h-3 mr-1" />
                {locale === 'zh' ? "待处理" : "Pending"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 进度条组件 */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/40">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {locale === 'zh' ? "进度条组件" : "Progress Components"}
          </CardTitle>
          <CardDescription>
            {locale === 'zh' ? "显示任务完成进度的组件" : "Components for showing task completion progress"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {locale === 'zh' ? "项目进度" : "Project Progress"}
                </span>
                <span className="text-gray-500">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {locale === 'zh' ? "下载进度" : "Download Progress"}
                </span>
                <span className="text-gray-500">45%</span>
              </div>
              <Progress value={45} className="h-3" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {locale === 'zh' ? "上传进度" : "Upload Progress"}
                </span>
                <span className="text-gray-500">90%</span>
              </div>
              <Progress value={90} className="h-4" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 头像组件 */}
      <Card className="bg-white/60 backdrop-blur-sm border-white/40">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {locale === 'zh' ? "头像组件" : "Avatar Components"}
          </CardTitle>
          <CardDescription>
            {locale === 'zh' ? "用户头像和占位符" : "User avatars and placeholders"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              {locale === 'zh' ? "不同尺寸" : "Different Sizes"}
            </h4>
            <div className="flex items-center gap-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/generic-user-avatar.png" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <Avatar className="w-10 h-10">
                <AvatarImage src="/generic-user-avatar.png" />
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <Avatar className="w-12 h-12">
                <AvatarImage src="/generic-user-avatar.png" />
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
              <Avatar className="w-16 h-16">
                <AvatarImage src="/generic-user-avatar.png" />
                <AvatarFallback>XL</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">
              {locale === 'zh' ? "用户信息卡片" : "User Info Cards"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-white/40 rounded-lg border border-white/30">
                <Avatar>
                  <AvatarImage src="/generic-user-avatar.png" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-800">John Doe</p>
                  <p className="text-sm text-gray-600">john@example.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-white/40 rounded-lg border border-white/30">
                <Avatar>
                  <AvatarImage src="/generic-user-avatar.png" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-800">Jane Smith</p>
                  <p className="text-sm text-gray-600">jane@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
