const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk(path.join(__dirname, 'src'), function(err, results) {
  if (err) throw err;
  results.filter(f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('@/lib/utils')) {
      const relativeDepth = path.relative(path.dirname(file), path.join(__dirname, 'src/lib/utils')).replace(/\\/g, '/');
      const replacement = relativeDepth.startsWith('.') ? relativeDepth : './' + relativeDepth;
      content = content.replace(/['"]@\/lib\/utils['"]/g, `"${replacement}"`);
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed:', file, '->', replacement);
    }
  });
});
