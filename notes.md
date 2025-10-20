---- local repo/folder github user config
git config user.name "<github user name>"
git config user.email "<github gmail id>"

---- add repo as remote repo
git remote add origin git@github.com:mohitbutola/LetsTrackIt.git

---- check configs
git remote -v

---- rename master to main branch
git branch -m main

---- git push
git add .
git commit -m "commit message"
git push origin <branch_name (main)>

---- sync remote and local
# Step 1: Fetch latest from GitHub
git fetch origin

# Step 2: Merge or rebase remote changes into your local main
git pull origin main --rebase

# Step 3: Push your code
git push origin main

---- Other Git commands
git checkout main/master
git checkout -b basicFeatures
git diff main/master <req branch>
git push origin <basicFeatures>

