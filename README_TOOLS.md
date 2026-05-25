# 🛠️ Xiaomi MiMo 100T - Automation Tools

This project includes automated tools for streamlining Xiaomi MiMo campaign submissions.

## 📦 Included Tools

### 1. Submission Validator (`validate-submission.js`)

Automated checker that validates your project against campaign requirements.

**Usage:**
```bash
npm run validate
# or
node validate-submission.js
```

**What it checks:**
- ✅ Required files (README, LICENSE, .gitignore, package.json)
- ✅ README quality (headers, code blocks, links, length)
- ✅ Git repository status (commits, remote, uncommitted changes)
- ✅ Package.json completeness
- ✅ License file
- ✅ Code quality (file count, LOC)
- ✅ Campaign deadline

**Output:**
- Validation score (0-100)
- Passed checks list
- Warnings and errors
- Submission readiness status

---

### 2. Submission Form Generator (`generate-submission-form.js`)

Generates pre-filled submission data for quick copy-paste into campaign forms.

**Usage:**
```bash
npm run submission
# or
node generate-submission-form.js
```

**What it generates:**
- 📋 Project name and repository URL
- 📝 Short and detailed descriptions
- 🏷️ Auto-generated tags/keywords
- 📂 Suggested category
- 📱 Social media post (Twitter/X format)
- ⏰ Deadline information
- ✅ Pre-submission checklist

**Output:**
- Console display with formatted sections
- `SUBMISSION_FORM.txt` file with all data

---

### 3. Project Template Generator (`/root/create-xiaomi-project.sh`)

Bash script that creates new Xiaomi projects with all required files.

**Usage:**
```bash
/root/create-xiaomi-project.sh my-new-project
cd my-new-project
```

**What it creates:**
- 📁 Project directory with git initialized
- 📄 README.md template
- 📄 SUBMISSION.md template
- 📄 CHECKLIST.md
- 📄 LICENSE (MIT)
- 📄 .gitignore
- 📄 Validator and form generator placeholders

---

## 🚀 Complete Workflow

### For This Project:

```bash
# 1. Validate
npm run validate

# 2. Generate submission form
npm run submission

# 3. Run both
npm run presubmit

# 4. View submission data
cat SUBMISSION_FORM.txt
```

### For New Projects:

```bash
# 1. Create from template
/root/create-xiaomi-project.sh my-project

# 2. Copy automation tools
cd my-project
cp /root/xiaomi-smart-home-ai/validate-submission.js .
cp /root/xiaomi-smart-home-ai/generate-submission-form.js .

# 3. Update package.json scripts
# Add: "validate", "submission", "presubmit"

# 4. Build your project
# ... code ...

# 5. Validate and submit
npm run presubmit
```

---

## 📊 Validation Scoring

| Component | Max Points | Description |
|-----------|------------|-------------|
| Required Files | 20 | README, LICENSE, .gitignore, package.json |
| README Quality | 25 | Headers, code blocks, links, length, Xiaomi mention |
| Git Status | 25 | Commits, remote, clean working tree |
| Package.json | 10 | Name, version, description, keywords, license |
| License | 5 | Valid license file |
| Code Quality | 10 | Source files, lines of code |
| Deadline | 5 | Before campaign deadline |
| **Total** | **100** | |

**Passing Score:** 80+  
**This Project:** 96/100 ✅

---

## 🎯 Submission Form Fields

The form generator extracts and formats:

1. **Basic Info**
   - Project name (from package.json)
   - Repository URL (from git remote)
   - Short description (first paragraph of README)

2. **Detailed Description**
   - Features list (extracted from README)
   - Tech stack
   - Project stats (commits, files, LOC)
   - Campaign mention

3. **Metadata**
   - Category (auto-suggested from keywords)
   - Tags (xiaomi, mimo, 100t + project keywords)

4. **Social Media**
   - Pre-formatted Twitter/X post
   - Hashtags included
   - Repository link

5. **Checklist**
   - Pre-submission requirements
   - Deadline information

---

## 💡 Tips

### Improve Validation Score:

1. **README (25 points)**
   - Add multiple headers (##)
   - Include code blocks with examples
   - Add badges/images
   - Link to repository
   - Mention "Xiaomi MiMo 100T"
   - Write >1000 characters

2. **Git (25 points)**
   - Make multiple commits (shows development)
   - Add GitHub remote
   - Commit all changes (clean working tree)

3. **Package.json (10 points)**
   - Include all fields: name, version, description
   - Add "xiaomi" to keywords
   - Specify license
   - Add repository field

4. **Code Quality (10 points)**
   - More source files = higher score
   - Well-structured code

---

## 🔧 Customization

### Modify Validator:

Edit `validate-submission.js`:
- Adjust scoring weights
- Add custom checks
- Change deadline date
- Modify required files list

### Modify Form Generator:

Edit `generate-submission-form.js`:
- Change output format
- Add custom fields
- Modify category detection
- Customize social media template

---

## 📁 File Locations

```
/root/
├── xiaomi-smart-home-ai/          # This project
│   ├── validate-submission.js     # Validator
│   ├── generate-submission-form.js # Form generator
│   ├── SUBMISSION_FORM.txt        # Generated form data
│   └── README_TOOLS.md            # This file
├── create-xiaomi-project.sh       # Template generator
└── XIAOMI_WORKFLOW.md             # Complete workflow guide
```

---

## ⏰ Deadline

**Campaign Deadline:** May 28, 2026 23:59 UTC  
**Current Time:** May 25, 2026 04:17 UTC  
**Time Remaining:** ~3 days 20 hours

---

## 🎓 Example Output

### Validator Output:
```
============================================================
🏆  XIAOMI MIMO 100T CAMPAIGN - SUBMISSION VALIDATOR
============================================================

✅ PASSED (24 checks)
⚠️ WARNINGS (2)
❌ ERRORS (0)

🎯 SUBMISSION SCORE: 96/100

🚀 PROJECT READY FOR SUBMISSION!
```

### Form Generator Output:
```
══════════════════════════════════════════════════════════
🎯  XIAOMI MIMO 100T - SUBMISSION FORM CHEAT SHEET
══════════════════════════════════════════════════════════

📋 BASIC INFORMATION
Project Name: xiaomi-smart-home-ai
Repository URL: https://github.com/1Windi03/xiaomi-smart-home-ai

📝 DETAILED DESCRIPTION
[Pre-formatted description with features, tech stack, stats]

🏷️ TAGS
xiaomi, mimo, 100t, ai, smart-home, iot, nlp, dashboard

💾 Saved to: SUBMISSION_FORM.txt
```

---

**Status:** ✅ Tools Complete and Tested  
**Project Score:** 96/100  
**Ready for Submission:** Yes 🚀
