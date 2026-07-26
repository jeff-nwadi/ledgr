const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(path.join(__dirname, 'app'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.includes('(session.session as any).businessId')) {
        content = content.replace(/\(session\.session as any\)\.businessId/g, '(session.user as any).businessId');
        changed = true;
    }
    
    if (content.includes('(session?.session as any)?.businessId')) {
        content = content.replace(/\(session\?\.session as any\)\?\.businessId/g, '(session?.user as any)?.businessId');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
