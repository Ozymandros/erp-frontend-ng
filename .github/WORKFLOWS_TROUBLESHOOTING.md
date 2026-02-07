# GitHub Actions Workflows Troubleshooting

## Issue: Workflows Not Showing in Actions Tab

### Root Cause
**FIXED:** The default branch is `master`, but workflows were configured to trigger on `main` (which doesn't exist). All workflows have been updated to trigger on `master` instead.

GitHub Actions only recognizes workflows that exist on the **default branch** (`master` in this repository). Workflows must also have correct branch triggers matching the actual branch names.

### Solution

1. **Merge workflows to default branch first:**
   - Merge PR #25 to `main` branch
   - After merge, workflows will appear in the Actions tab
   - They will then trigger on future PRs and pushes

2. **Verify workflow triggers:**
   - All workflows trigger on:
     - `pull_request` to `main` or `develop`
     - `push` to `main`
   - Ensure your PR targets one of these branches

3. **Check repository settings:**
   - Go to Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is enabled
   - Check "Workflow permissions" settings

### Current Workflow Status

All 8 workflow files are present and syntactically correct:
- ✅ `audit.yml` - Dependency Security Audit (Deprecated)
- ✅ `build.yml` - Build Verification
- ✅ `codeql.yml` - CodeQL Analysis
- ✅ `lint.yml` - Lint & Type Check
- ✅ `security.yml` - Security Checks
- ✅ `sonarqube.yml` - SonarQube Community Analysis
- ✅ `tests.yml` - Test Suites (Unit + Playwright)
- ✅ `workflow-lint.yml` - Workflow Lint

### Verification Steps

After merging to `main`:
1. Go to Actions tab in GitHub
2. You should see all 8 workflows listed
3. Create a test PR to trigger them
4. Workflows should run automatically

### Note
Workflows will run from PR branches once they exist on `main`, but they won't appear in the Actions tab UI until merged to the default branch.
