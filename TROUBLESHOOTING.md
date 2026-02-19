# Troubleshooting Guide for LingoBridge

## Common Issues and Solutions

### 🚨 Git Checkout Error: "Deletion of directory failed"

**Problem:** When trying to checkout a branch, you see errors like:
```
Deletion of directory 'backend' failed. Should I try again? (y/n)
Deletion of directory 'dataset/asl_videos' failed. Should I try again? (y/n)
```

#### ✅ Don't Panic! Your Work is Safe

**Important:** If Git cannot delete directories during checkout, it **will NOT complete the checkout**. This means:
- ✅ Your files are still there
- ✅ You're still on your original branch
- ✅ No data has been lost

#### 🔍 Why This Happens (Especially on Windows)

1. **Files are open** - You have files from these directories open in:
   - Text editor (VS Code, Notepad++, etc.)
   - File explorer
   - Command prompt/PowerShell
   - Running application (Python server, etc.)

2. **Process locks** - A process is using files in those directories:
   - Development server running
   - Python virtual environment active
   - Database connection open
   - IDE indexing files

3. **Permission issues** - Windows file permissions or antivirus software blocking deletion

#### 🛠️ Solution 1: Close All Applications (Recommended)

1. **Close your text editor/IDE** (VS Code, PyCharm, etc.)
2. **Stop all running servers** (Press Ctrl+C in terminals)
3. **Close all File Explorer windows** showing the project
4. **Exit Python virtual environment** if active:
   ```powershell
   deactivate
   ```
5. **Close all PowerShell/Command Prompt windows** in the project directory
6. **Try checkout again**:
   ```powershell
   git checkout copilot/add-speech-to-sign-translation
   ```

#### 🛠️ Solution 2: Force Delete and Checkout

If Solution 1 doesn't work:

1. **Check current branch** (to know where you are):
   ```powershell
   git branch
   ```

2. **Manually delete the directories**:
   ```powershell
   # Close all applications first, then:
   Remove-Item -Recurse -Force backend
   Remove-Item -Recurse -Force dataset
   ```

3. **If deletion still fails**, restart File Explorer:
   ```powershell
   taskkill /f /im explorer.exe
   start explorer.exe
   ```

4. **Try deleting again** and then **checkout**:
   ```powershell
   git checkout copilot/add-speech-to-sign-translation
   ```

#### 🛠️ Solution 3: Clean Checkout (Safe Method)

If you want to be extra safe:

1. **Check what changes you have**:
   ```powershell
   git status
   ```

2. **If you have uncommitted changes you want to keep**:
   ```powershell
   git stash save "My backup before checkout"
   ```

3. **Force clean** (removes untracked files):
   ```powershell
   git clean -fd
   ```

4. **Now checkout**:
   ```powershell
   git checkout copilot/add-speech-to-sign-translation
   ```

5. **If you stashed changes and want them back**:
   ```powershell
   git stash pop
   ```

#### 🛠️ Solution 4: Fresh Start (Last Resort)

If nothing works, create a fresh clone:

1. **Navigate to parent directory**:
   ```powershell
   cd C:\Users\ibnat
   ```

2. **Rename current directory** (backup):
   ```powershell
   Rename-Item lingobridge lingobridge-backup
   ```

3. **Clone fresh**:
   ```powershell
   git clone https://github.com/Kyreena/LingoBridge.git lingobridge
   cd lingobridge
   git checkout copilot/add-speech-to-sign-translation
   ```

4. **Copy any custom files** from backup if needed

#### 📋 Prevention Tips

To avoid this issue in the future:

1. **Always close applications** before switching branches
2. **Deactivate virtual environments** before checkout:
   ```powershell
   deactivate
   ```
3. **Stop development servers** before checkout
4. **Use Git from a terminal** that's not in the project directory
5. **Commit or stash changes** before switching branches

---

### 🔄 "Already on branch" Warning

**Problem:** You see: `Already on 'copilot/add-speech-to-sign-translation'`

**Solution:** You're already on the correct branch! Check with:
```powershell
git branch
git status
```

---

### 📥 Pull Issues After Checkout

**Problem:** After checkout, files don't look right

**Solution:** Pull the latest changes:
```powershell
git pull origin copilot/add-speech-to-sign-translation
```

---

### 🔀 Merge Conflicts

**Problem:** Merge conflicts when pulling or switching branches

**Solution:**

1. **See which files have conflicts**:
   ```powershell
   git status
   ```

2. **Open conflicted files** and look for markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Incoming changes
   >>>>>>> branch-name
   ```

3. **Edit files** to keep what you want

4. **Mark as resolved**:
   ```powershell
   git add <filename>
   git commit -m "Resolved merge conflicts"
   ```

---

### 🆘 How to Check if Your Work is Safe

Run these commands to verify:

```powershell
# See current branch
git branch

# See file status
git status

# See recent commits
git log --oneline -5

# List files in current directory
dir
```

If you see your files and folders, **your work is safe!**

---

### 📞 Still Need Help?

1. **Check `git status`** and share the output
2. **List files** with `dir` or `ls -la`
3. **Check current branch** with `git branch`
4. **Review Git log** with `git log --oneline -5`

Include this information when asking for help!

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `git branch` | Show current branch |
| `git status` | Show file status |
| `git checkout <branch>` | Switch branches |
| `git clean -fd` | Remove untracked files/dirs |
| `git stash` | Temporarily save changes |
| `git stash pop` | Restore stashed changes |
| `deactivate` | Exit Python virtual environment |

---

**Remember:** Git is designed to protect your data. If something fails, it's usually preventing data loss, not causing it! 🛡️
