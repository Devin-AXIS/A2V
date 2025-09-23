// 个人档案相关卡片组件导出
export { BasicInfoCard, type BasicInfo } from './basic-info-card'

// 通用可配置组件
export { 
  GenericFormCard, 
  type FieldConfig, 
  type DisplayConfig, 
  type DataItem 
} from './generic-form-card'

// 预定义配置
export { jobExpectationFields, jobExpectationDisplay } from './job-expectation-config'
export { educationFields, educationDisplay } from './education-config'
export { workExperienceFields, workExperienceDisplay } from './work-experience-config'
export { projectFields, projectDisplay } from './project-config'
export { certificateFields, certificateDisplay } from './certificate-config'
export { 
  identityVerificationFields, 
  identityVerificationDisplay,
  type IdentityVerificationData,
  defaultIdentityVerificationData
} from './identity-verification-config'
export { 
  passwordChangeFields, 
  passwordChangeDisplay,
  type PasswordChangeData,
  defaultPasswordChangeData
} from './password-change-config'
export { 
  phoneBindingFields, 
  phoneBindingDisplay,
  type PhoneBindingData,
  defaultPhoneBindingData
} from './phone-binding-config'
