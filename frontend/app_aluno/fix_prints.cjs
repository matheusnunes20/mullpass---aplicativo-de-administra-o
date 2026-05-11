const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.dart')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // My previous script replaced `print(` with `(` because $1 evaluated to empty.
            // But wait! It replaced `\n    print(` with `\n    (`. So there is white space followed by `(`.
            // Let's replace `print` with `debugPrint` properly.
            // And for the broken ones, let's fix them. Wait, if it's broken like `     ('AULA STATUS: ');`,
            // we can look for spaces followed by `('` or `("` without a function name.
            // Actually, `content.replace(/([^\w_]|^)print\(/g, '$1debugPrint(')` would work if $1 was passed literally.

            // First, let's restore the original file from git if possible? No, we just fix it.
            // Let's use `git checkout` for just the content changes, but wait! We changed imports and filenames.
            
            // Let's manually replace `   ('` with `   debugPrint('` if it matches the pattern of a broken print.
            // Broken prints look like: `\n     ('` or `\n   ('`.
            const regex = /^(\s*)\((['"].*?['"])\);/gm;
            if (content.match(regex)) {
                content = content.replace(regex, '$1debugPrint($2);');
                modified = true;
            }

            // Also replace any remaining `print(`
            if (content.match(/([^\w_]|^)print\(/)) {
                content = content.replace(/([^\w_]|^)print\(/g, '$1debugPrint(');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed prints in', fullPath);
            }
        }
    }
}

processDir('lib');
