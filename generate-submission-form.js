#!/usr/bin/env node

/**
 * Xiaomi MiMo 100T Campaign - Submission Form Generator
 * Generates pre-filled submission data for quick copy-paste
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SubmissionFormGenerator {
    constructor(projectPath = process.cwd()) {
        this.projectPath = projectPath;
        this.data = {};
    }

    // Extract project info
    extractProjectInfo() {
        // Get package.json
        const pkgPath = path.join(this.projectPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            this.data.name = pkg.name;
            this.data.description = pkg.description;
            this.data.keywords = pkg.keywords || [];
        }

        // Get README
        const readmePath = path.join(this.projectPath, 'README.md');
        if (fs.existsSync(readmePath)) {
            const readme = fs.readFileSync(readmePath, 'utf8');
            
            // Extract first paragraph as short description
            const lines = readme.split('\n').filter(l => l.trim() && !l.startsWith('#'));
            this.data.shortDesc = lines[0] || this.data.description;
            
            // Extract features
            const featuresMatch = readme.match(/##\s+(?:Features|✨\s+Features)([\s\S]*?)(?=##|$)/i);
            if (featuresMatch) {
                this.data.features = featuresMatch[1]
                    .split('\n')
                    .filter(l => l.trim().match(/^[-*•]/))
                    .map(l => l.replace(/^[-*•]\s*/, '').trim())
                    .slice(0, 5);
            }
        }

        // Get git info
        try {
            this.data.repoUrl = execSync('git remote get-url origin', { 
                cwd: this.projectPath, 
                stdio: 'pipe' 
            }).toString().trim().replace(/^https:\/\/.*?@/, 'https://');
            
            this.data.commits = execSync('git rev-list --count HEAD', { 
                cwd: this.projectPath, 
                stdio: 'pipe' 
            }).toString().trim();
        } catch (e) {
            this.data.repoUrl = 'N/A';
            this.data.commits = '0';
        }

        // Count files and LOC
        try {
            const files = execSync('git ls-files | wc -l', { 
                cwd: this.projectPath, 
                stdio: 'pipe' 
            }).toString().trim();
            this.data.files = files;

            const loc = execSync('find . -name "*.js" -o -name "*.py" -o -name "*.java" -o -name "*.go" | xargs wc -l 2>/dev/null | tail -1', { 
                cwd: this.projectPath, 
                stdio: 'pipe' 
            }).toString().trim().split(/\s+/)[0];
            this.data.loc = loc || '0';
        } catch (e) {
            this.data.files = '0';
            this.data.loc = '0';
        }
    }

    // Generate submission form data
    generate() {
        this.extractProjectInfo();

        const now = new Date();
        const deadline = new Date('2026-05-28T23:59:59Z');
        const timeLeft = deadline - now;
        const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        console.log('\n' + '═'.repeat(70));
        console.log('🎯  XIAOMI MIMO 100T - SUBMISSION FORM CHEAT SHEET');
        console.log('═'.repeat(70) + '\n');

        // Basic Info
        console.log('📋 BASIC INFORMATION\n');
        console.log(`Project Name:`);
        console.log(`  ${this.data.name || 'N/A'}\n`);
        
        console.log(`Repository URL:`);
        console.log(`  ${this.data.repoUrl}\n`);
        
        console.log(`Short Description (1 line):`);
        console.log(`  ${this.data.shortDesc || this.data.description || 'N/A'}\n`);

        // Detailed Description
        console.log('─'.repeat(70) + '\n');
        console.log('📝 DETAILED DESCRIPTION (for submission form)\n');
        
        const detailedDesc = `${this.data.description || this.data.name}

🎯 Key Features:
${(this.data.features || ['Feature 1', 'Feature 2', 'Feature 3']).map(f => `• ${f}`).join('\n')}

🛠️ Tech Stack:
• Built with modern technologies
• Clean, maintainable code
• Comprehensive documentation

📊 Project Stats:
• ${this.data.commits} commits
• ${this.data.files} files
• ${this.data.loc} lines of code

🔗 Repository: ${this.data.repoUrl}

Built for Xiaomi MiMo 100T Creator Program 🏆`;

        console.log(detailedDesc);
        console.log();

        // Tags/Keywords
        console.log('─'.repeat(70) + '\n');
        console.log('🏷️  TAGS/KEYWORDS (comma-separated)\n');
        const tags = [
            'xiaomi',
            'mimo',
            '100t',
            'ai',
            ...(this.data.keywords || [])
        ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 10);
        console.log(`  ${tags.join(', ')}\n`);

        // Category
        console.log('─'.repeat(70) + '\n');
        console.log('📂 SUGGESTED CATEGORY\n');
        const keywords = (this.data.keywords || []).join(' ').toLowerCase();
        let category = 'Other';
        if (keywords.includes('ai') || keywords.includes('ml')) category = 'AI/Machine Learning';
        else if (keywords.includes('iot') || keywords.includes('smart')) category = 'IoT/Smart Home';
        else if (keywords.includes('web') || keywords.includes('dashboard')) category = 'Web Application';
        else if (keywords.includes('bot') || keywords.includes('telegram')) category = 'Bot/Automation';
        console.log(`  ${category}\n`);

        // Social Media Post
        console.log('─'.repeat(70) + '\n');
        console.log('📱 SOCIAL MEDIA POST (Twitter/X format)\n');
        const socialPost = `🚀 Just submitted my project to #XiaomiMiMo100T Creator Program!

${this.data.name || 'My Project'}
${this.data.shortDesc || this.data.description || ''}

${(this.data.features || []).slice(0, 3).map(f => `✨ ${f}`).join('\n')}

Check it out: ${this.data.repoUrl}

#Xiaomi #MiMo #AI #OpenSource #Tech`;
        console.log(socialPost);
        console.log();

        // Deadline Info
        console.log('─'.repeat(70) + '\n');
        console.log('⏰ DEADLINE INFORMATION\n');
        console.log(`Campaign Deadline: May 28, 2026 23:59 UTC`);
        console.log(`Time Remaining: ${daysLeft}d ${hoursLeft}h`);
        if (daysLeft < 1) {
            console.log(`⚠️  WARNING: Less than 24 hours remaining!\n`);
        } else {
            console.log(`✅ You have ${daysLeft} days to submit\n`);
        }

        // Quick Copy Section
        console.log('═'.repeat(70) + '\n');
        console.log('📋 QUICK COPY (for form fields)\n');
        console.log('─'.repeat(70));
        console.log(`Project Name:     ${this.data.name || 'N/A'}`);
        console.log(`Repository URL:   ${this.data.repoUrl}`);
        console.log(`Category:         ${category}`);
        console.log(`Tags:             ${tags.join(', ')}`);
        console.log('─'.repeat(70) + '\n');

        // Checklist
        console.log('✅ PRE-SUBMISSION CHECKLIST\n');
        const checklist = [
            'Repository is public',
            'README.md is complete',
            'LICENSE file included',
            'All code is committed and pushed',
            'No sensitive data (API keys, tokens)',
            'Project builds and runs',
            'Validation score > 80',
            'Xiaomi MiMo mentioned in README'
        ];
        checklist.forEach(item => console.log(`  [ ] ${item}`));
        console.log();

        console.log('═'.repeat(70) + '\n');
        console.log('💡 TIP: Copy the sections above and paste into submission form\n');
        console.log('═'.repeat(70) + '\n');

        // Save to file
        const outputPath = path.join(this.projectPath, 'SUBMISSION_FORM.txt');
        const output = `XIAOMI MIMO 100T - SUBMISSION FORM DATA
Generated: ${now.toISOString()}

═══════════════════════════════════════════════════════════════════

PROJECT NAME:
${this.data.name || 'N/A'}

REPOSITORY URL:
${this.data.repoUrl}

SHORT DESCRIPTION:
${this.data.shortDesc || this.data.description || 'N/A'}

DETAILED DESCRIPTION:
${detailedDesc}

CATEGORY:
${category}

TAGS:
${tags.join(', ')}

SOCIAL MEDIA POST:
${socialPost}

═══════════════════════════════════════════════════════════════════

DEADLINE: May 28, 2026 23:59 UTC
TIME REMAINING: ${daysLeft}d ${hoursLeft}h

═══════════════════════════════════════════════════════════════════
`;

        fs.writeFileSync(outputPath, output);
        console.log(`💾 Saved to: ${outputPath}\n`);
    }
}

// CLI execution
if (require.main === module) {
    const projectPath = process.argv[2] || process.cwd();
    const generator = new SubmissionFormGenerator(projectPath);
    generator.generate();
}

module.exports = SubmissionFormGenerator;
