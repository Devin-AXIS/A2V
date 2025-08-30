# Development Standards

## Git Workflow

### Branch Strategy
- **develop**: Development branch for all new features and fixes
- **main**: Production branch, only merged after testing confirmation
- **Workflow**: `develop` → testing → `main`

### Commit Process
1. Create feature branch from `develop`
2. Develop and commit changes
3. Push to `develop` branch
4. Wait for user confirmation
5. Merge to `main` after approval

### Commit Message Convention

#### Format
```
<type>: <description>

[optional body]

[optional footer]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation update
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Test related
- `chore`: Build process or tool changes

#### Examples
```bash
# Good commit messages
feat: add skills field validation logic
fix: resolve skills field save validation error
docs: update API documentation for skills field
refactor: optimize skills field component structure

# Avoid
feat: 完善技能字段功能并修复验证问题  # Chinese
fix: 修复技能字段保存时的验证错误      # Chinese
```

## Code Standards

### Language Requirements
- **All code comments**: English only
- **Variable and function names**: English only
- **Documentation**: English only
- **Commit messages**: English only

### Comment Examples
```typescript
// Good: English comments
/**
 * Validates skills field selection against allowed options
 * @param value - Array of selected skill IDs
 * @param fieldDef - Field definition with skillsConfig
 * @returns Validation result with error message if invalid
 */
function validateSkillsField(value: string[], fieldDef: FieldDef) {
  // Check if skills field has custom configuration
  if (fieldDef.schema?.preset === 'skills') {
    // Get allowed skill IDs from configuration
    const allowedSkillIds = getSkillIds(fieldDef.schema.skillsConfig)
    // Validate selected skills
    return validateSkillSelection(value, allowedSkillIds)
  }
}
```

### Naming Conventions
- **Variables**: camelCase (e.g., `userName`, `isValid`)
- **Functions**: camelCase (e.g., `validateField`, `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (e.g., `UserModel`, `FieldDef`)

## Development Process

### Before Starting Work
1. Ensure you're on `develop` branch
2. Pull latest changes: `git pull origin develop`
3. Create feature branch: `git checkout -b feature/your-feature-name`

### During Development
1. Write code with English comments
2. Follow naming conventions
3. Test your changes
4. Commit with proper English messages

### Before Pushing
1. Review your changes
2. Ensure all comments are in English
3. Test functionality
4. Commit with descriptive English message

### After Development
1. Push to `develop`: `git push origin develop`
2. Wait for user confirmation
3. After approval, merge to `main`

## Code Review Checklist

- [ ] All comments are in English
- [ ] Variable and function names are in English
- [ ] Commit message follows convention
- [ ] Code follows naming conventions
- [ ] No Chinese text in code or comments
- [ ] Functionality works as expected
- [ ] No breaking changes to existing features

## Examples

### Good Practices
```typescript
// English comments
interface UserProfile {
  id: string
  name: string
  email: string
  skills: string[]
}

/**
 * Updates user profile with new skills
 * @param userId - User identifier
 * @param skills - Array of skill IDs to add
 * @returns Updated user profile
 */
async function updateUserSkills(userId: string, skills: string[]): Promise<UserProfile> {
  // Validate skills before updating
  const validSkills = await validateSkills(skills)
  
  // Update user profile
  return await userRepository.updateSkills(userId, validSkills)
}
```

### Avoid
```typescript
// Chinese comments - AVOID
interface 用户档案 {
  id: string
  name: string
  email: string
  skills: string[]
}

/**
 * 更新用户档案的技能
 * @param userId - 用户ID
 * @param skills - 要添加的技能ID数组
 * @returns 更新后的用户档案
 */
async function 更新用户技能(userId: string, skills: string[]): Promise<用户档案> {
  // 更新前验证技能
  const validSkills = await 验证技能(skills)
  
  // 更新用户档案
  return await 用户仓库.更新技能(userId, validSkills)
}
```
