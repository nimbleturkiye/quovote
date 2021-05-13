const path = require('path');
const child_process = require('child_process');

const projects = [
  'frontend',
  'backend',
];

const files = process.argv.slice(2);

const rootFolder = path.join(__dirname, '..', '..');

const projectFiles = {};

files.forEach((file) => {
  projects.forEach((project) => {
    if (file.indexOf(project) != 0) return;

    if (!projectFiles[project]) projectFiles[project] = [];

    const relativePathToProject = path.relative(project, file);
    projectFiles[project].push(relativePathToProject);
  });
});

for (let project of Object.keys(projectFiles)) {
  const projectPath = path.join(rootFolder, project);
  const relativeFilePaths = projectFiles[project];

  console.log(`[${project}] Will lint ${relativeFilePaths.length} file(s):`);
  relativeFilePaths.forEach(f => console.log(` - ${f}`));

  const result = child_process.spawnSync(
    path.join(projectPath, './node_modules/.bin/eslint'),
    relativeFilePaths,
    {
      cwd: projectPath,
      stdio:'inherit',
    }
  );

  if (result.status !== 0) process.exit(result.status);
}
