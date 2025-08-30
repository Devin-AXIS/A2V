# GitHub Commit Mechanism and Branch Strategy

## Branch Strategy

### Main Branches
- **`develop` branch**: Development branch where all new features and fixes are implemented
- **`main` branch**: Production branch, only merged after testing and confirmation
- **Workflow**: `develop` → testing confirmation → `main`

## Commit Process

### 1. Development Phase
- All code changes are committed to the `develop` branch
- Regular commits with descriptive messages
- Automatic push to GitHub remote repository after each commit

### 2. Testing Confirmation
- Testing is performed on the `develop` branch
- Bug fixes and improvements are made directly on `develop`
- Only stable, tested code proceeds to `main`

### 3. Merge to Main
- **IMPORTANT**: Only merge to `main` when explicitly instructed with "合并到main"
- Merge preserves all commit history
- No direct pushes to `main` branch allowed

## Commit Message Standards

### Language
- All commit messages must be in English

### Format
```
<type>: <description>
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `chore`: Maintenance tasks
- `refactor`: Code refactoring
- `test`: Test-related changes
- `style`: Code style changes

### Examples
```
feat: add user authentication system
fix: resolve API endpoint timeout issue
docs: update API documentation
chore: update dependencies
```

## Code Standards

### Language Requirements
- **Comments**: All code comments must be in English
- **Variables**: All variable, function, and class names must be in English
- **Documentation**: All documentation and descriptions must be in English

## Security Mechanisms

### Branch Protection
- **No direct pushes to main**: Absolutely no direct pushes to `main` branch
- **Explicit instruction required**: Only merge to `main` when explicitly instructed
- **History preservation**: All commit history is preserved during merges
- **No content overwriting**: Existing content is never overwritten

## Current Status

### Repository Setup
- ✅ Git repository initialized
- ✅ `main` branch created (production)
- ✅ `develop` branch created (development)
- ✅ Currently on `develop` branch
- ✅ Proper `.gitignore` configured

### Next Steps
- Set up GitHub remote repository
- Configure branch protection rules
- Implement automated testing pipeline
- Set up CI/CD workflows

## Workflow Commands

### Daily Development
```bash
# Start development
git checkout develop
git pull origin develop

# Make changes and commit
git add .
git commit -m "feat: add new feature"
git push origin develop
```

### Merge to Production (Only when instructed)
```bash
# Switch to main and merge
git checkout main
git merge develop
git push origin main

# Return to develop
git checkout develop
```

## Best Practices

1. **Frequent commits**: Commit small, logical changes frequently
2. **Descriptive messages**: Write clear, descriptive commit messages
3. **Test before merge**: Always test thoroughly before merging to main
4. **Review changes**: Review all changes before committing
5. **Follow standards**: Strictly follow English-only policy for all code and documentation
