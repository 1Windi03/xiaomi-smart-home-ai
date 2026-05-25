#!/usr/bin/env node

/**
 * Xiaomi MiMo 100T Campaign - Automated Submission Validator
 * Validates project completeness before submission
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CAMPAIGN_DEADLINE = new Date('2026-05-28T23:59:59Z');
const REQUIRED_FILES = [
    'README.md',
    'package.json',
    'LICENSE',
    '.gitignore'
];

const OPTIONAL_FILES = [
    'SUBMISSION.md',
    'DEMO.md',
    'CONTRIBUTING.md',
    'CHANGELOG.md'
];

class XiaomiSubmissionValidator {
    constructor(projectPath = process.cwd()) {
        this.projectPath = projectPath;
        this.errors = [];
        this.warnings = [];
        this.passed = [];
        this.score = 0;
        this.maxScore = 100;
    }

    log(emoji, message, type = 'info') {
        const colors = {
            error: '\x1b[31m',
            warning: '\x1b[33m',
            success: '\x1b[32m',
            info: '\x1b[36m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}${emoji} ${message}${colors.reset}`);
    }

    // Check 1: Required files exist
    checkRequiredFiles() {
        this.log('📁', 'Checking required files...', 'info');
        let allPresent = true;

        REQUIRED_FILES.forEach(file => {
            const filePath = path.join(this.projectPath, file);
            if (fs.existsSync(filePath)) {
                this.passed.push(`Required file: ${file}`);
                this.score += 5;
            } else {
                this.errors.push(`Missing required file: ${file}`);
                allPresent = false;
            }
        });

        OPTIONAL_FILES.forEach(file => {
            const filePath = path.join(this.projectPath, file);
            if (fs.existsSync(filePath)) {
                this.passed.push(`Optional file: ${file}`);
                this.score += 2;
            } else {
                this.warnings.push(`Missing optional file: ${file} (recommended)`);
            }
        });

        return allPresent;
    }

    // Check 2: README quality
    checkReadmeQuality() {
        this.log('📖', 'Validating README.md...', 'info');
        const readmePath = path.join(this.projectPath, 'README.md');
        
        if (!fs.existsSync(readmePath)) {
            this.errors.push('README.md not found');
            return false;
        }

        const content = fs.readFileSync(readmePath, 'utf8');
        const checks = [
            { pattern: /#+\s+.+/g, name: 'Headers', min: 3 },
            { pattern: /```[\s\S]*?```/g, name: 'Code blocks', min: 1 },
            { pattern: /!\[.*?\]\(.*?\)/g, name: 'Images/badges', min: 0 },
            { pattern: /\[.*?\]\(https?:\/\/.*?\)/g, name: 'Links', min: 2 },
            { pattern: /##\s+(Features|Installation|Usage)/gi, name: 'Key sections', min: 2 }
        ];

        let qualityScore = 0;
        checks.forEach(check => {
            const matches = content.match(check.pattern) || [];
            if (matches.length >= check.min) {
                this.passed.push(`README has ${matches.length} ${check.name}`);
                qualityScore += 3;
            } else {
                this.warnings.push(`README should have at least ${check.min} ${check.name}`);
            }
        });

        // Check length
        if (content.length > 1000) {
            this.passed.push('README is comprehensive (>1000 chars)');
            qualityScore += 5;
        } else {
            this.warnings.push('README is too short (<1000 chars)');
        }

        // Check for Xiaomi mention
        if (/xiaomi|mimo|100t/gi.test(content)) {
            this.passed.push('README mentions Xiaomi MiMo campaign');
            qualityScore += 5;
        } else {
            this.warnings.push('README should mention Xiaomi MiMo 100T campaign');
        }

        this.score += qualityScore;
        return true;
    }

    // Check 3: Git repository status
    checkGitStatus() {
        this.log('🔧', 'Checking Git repository...', 'info');
        
        try {
            // Check if git repo
            execSync('git rev-parse --git-dir', { cwd: this.projectPath, stdio: 'pipe' });
            this.passed.push('Git repository initialized');
            this.score += 5;

            // Check for commits
            const commitCount = execSync('git rev-list --count HEAD', { 
                cwd: this.projectPath, 
                stdio: 'pipe' 
            }).toString().trim();
            
            if (parseInt(commitCount) > 0) {
                this.passed.push(`Git has ${commitCount} commit(s)`);
                this.score += 5;
            } else {
                this.warnings.push('No commits found');
            }

            // Check for remote
            try {
                const remote = execSync('git remote get-url origin', { 
                    cwd: this.projectPath, 
                    stdio: 'pipe' 
                }).toString().trim();
                
                if (remote.includes('github.com')) {
                    this.passed.push('GitHub remote configured');
                    this.score += 10;
                } else {
                    this.warnings.push('Remote is not GitHub');
                }
            } catch (e) {
                this.warnings.push('No remote repository configured');
            }

            // Check for uncommitted changes
            const status = execSync('git status --porcelain', { 
                cwd: this.projectPath, 
                stdio: 'pipe' 
            }).toString().trim();
            
            if (status) {
                this.warnings.push('Uncommitted changes detected - commit before submission');
            } else {
                this.passed.push('No uncommitted changes');
                this.score += 3;
            }

        } catch (e) {
            this.errors.push('Not a Git repository');
            return false;
        }

        return true;
    }

    // Check 4: Package.json validation
    checkPackageJson() {
        this.log('📦', 'Validating package.json...', 'info');
        const pkgPath = path.join(this.projectPath, 'package.json');
        
        if (!fs.existsSync(pkgPath)) {
            this.warnings.push('package.json not found (OK if not Node.js project)');
            return true;
        }

        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            
            const requiredFields = ['name', 'version', 'description'];
            requiredFields.forEach(field => {
                if (pkg[field]) {
                    this.passed.push(`package.json has ${field}`);
                    this.score += 2;
                } else {
                    this.warnings.push(`package.json missing ${field}`);
                }
            });

            if (pkg.keywords && pkg.keywords.includes('xiaomi')) {
                this.passed.push('package.json includes xiaomi keyword');
                this.score += 3;
            }

            if (pkg.license) {
                this.passed.push(`License: ${pkg.license}`);
                this.score += 2;
            }

            if (pkg.repository) {
                this.passed.push('Repository field configured');
                this.score += 3;
            }

        } catch (e) {
            this.errors.push('Invalid package.json format');
            return false;
        }

        return true;
    }

    // Check 5: License validation
    checkLicense() {
        this.log('⚖️', 'Checking license...', 'info');
        const licensePath = path.join(this.projectPath, 'LICENSE');
        
        if (fs.existsSync(licensePath)) {
            const content = fs.readFileSync(licensePath, 'utf8');
            if (content.length > 100) {
                this.passed.push('LICENSE file present and valid');
                this.score += 5;
            } else {
                this.warnings.push('LICENSE file seems incomplete');
            }
        } else {
            this.warnings.push('No LICENSE file (recommended for open source)');
        }

        return true;
    }

    // Check 6: Campaign deadline
    checkDeadline() {
        this.log('⏰', 'Checking campaign deadline...', 'info');
        const now = new Date();
        const timeLeft = CAMPAIGN_DEADLINE - now;
        const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (timeLeft > 0) {
            this.passed.push(`Campaign deadline: ${daysLeft}d ${hoursLeft}h remaining`);
            this.score += 5;
        } else {
            this.errors.push('Campaign deadline has passed!');
            return false;
        }

        if (daysLeft < 1) {
            this.warnings.push('Less than 24 hours until deadline!');
        }

        return true;
    }

    // Check 7: Code quality (basic)
    checkCodeQuality() {
        this.log('🔍', 'Checking code quality...', 'info');
        
        // Count source files
        const extensions = ['.js', '.ts', '.py', '.java', '.go', '.rs'];
        let fileCount = 0;
        let totalLines = 0;

        const countFiles = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    countFiles(fullPath);
                } else if (stat.isFile()) {
                    const ext = path.extname(item);
                    if (extensions.includes(ext)) {
                        fileCount++;
                        const content = fs.readFileSync(fullPath, 'utf8');
                        totalLines += content.split('\n').length;
                    }
                }
            });
        };

        countFiles(this.projectPath);

        if (fileCount > 0) {
            this.passed.push(`${fileCount} source files, ${totalLines} lines of code`);
            this.score += Math.min(fileCount * 2, 10);
        } else {
            this.warnings.push('No source code files detected');
        }

        return true;
    }

    // Run all checks
    async validate() {
        console.log('\n' + '='.repeat(60));
        console.log('🏆  XIAOMI MIMO 100T CAMPAIGN - SUBMISSION VALIDATOR');
        console.log('='.repeat(60) + '\n');

        this.checkDeadline();
        this.checkRequiredFiles();
        this.checkReadmeQuality();
        this.checkGitStatus();
        this.checkPackageJson();
        this.checkLicense();
        this.checkCodeQuality();

        // Calculate final score
        this.score = Math.min(this.score, this.maxScore);

        // Print results
        console.log('\n' + '='.repeat(60));
        console.log('📊  VALIDATION RESULTS');
        console.log('='.repeat(60) + '\n');

        if (this.passed.length > 0) {
            this.log('✅', `PASSED (${this.passed.length} checks)`, 'success');
            this.passed.forEach(msg => console.log(`   ✓ ${msg}`));
            console.log();
        }

        if (this.warnings.length > 0) {
            this.log('⚠️', `WARNINGS (${this.warnings.length})`, 'warning');
            this.warnings.forEach(msg => console.log(`   ⚠ ${msg}`));
            console.log();
        }

        if (this.errors.length > 0) {
            this.log('❌', `ERRORS (${this.errors.length})`, 'error');
            this.errors.forEach(msg => console.log(`   ✗ ${msg}`));
            console.log();
        }

        // Score and recommendation
        console.log('='.repeat(60));
        const scoreColor = this.score >= 80 ? 'success' : this.score >= 60 ? 'warning' : 'error';
        this.log('🎯', `SUBMISSION SCORE: ${this.score}/${this.maxScore}`, scoreColor);
        console.log('='.repeat(60) + '\n');

        if (this.score >= 80 && this.errors.length === 0) {
            this.log('🚀', 'PROJECT READY FOR SUBMISSION!', 'success');
            console.log('\n   Next steps:');
            console.log('   1. Push to GitHub: git push origin main');
            console.log('   2. Submit repository URL to Xiaomi MiMo campaign');
            console.log('   3. Add campaign hashtags and description\n');
        } else if (this.errors.length > 0) {
            this.log('🛑', 'FIX ERRORS BEFORE SUBMISSION', 'error');
            console.log('\n   Fix the errors listed above and run validator again.\n');
        } else {
            this.log('⚡', 'SUBMISSION POSSIBLE BUT IMPROVEMENTS RECOMMENDED', 'warning');
            console.log('\n   Address warnings to improve submission quality.\n');
        }

        return {
            score: this.score,
            passed: this.passed.length,
            warnings: this.warnings.length,
            errors: this.errors.length,
            ready: this.score >= 80 && this.errors.length === 0
        };
    }
}

// CLI execution
if (require.main === module) {
    const projectPath = process.argv[2] || process.cwd();
    const validator = new XiaomiSubmissionValidator(projectPath);
    
    validator.validate().then(result => {
        process.exit(result.errors > 0 ? 1 : 0);
    }).catch(err => {
        console.error('Validation error:', err);
        process.exit(1);
    });
}

module.exports = XiaomiSubmissionValidator;
