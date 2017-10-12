# Dotfiles utility

Often you have to maintain project configurations (e.g. settings for your favorite editor)
that you don't want to include in commits to the actual git repository.

However, sometimes it can be useful to share these files across multiple workstations or to
have different versions available for different versions of the source code.

This nodejs utility aims to help with this by wrapping git, providing some additional magic:

- The idea is to create a second git repository inside your existing git work tree, which
  select configuration files are committed into.
- Roughly based on this post, the use case is slighly different, though:
  https://developer.atlassian.com/blog/2016/02/best-way-to-store-dotfiles-git-bare-repo/
- Push changes to the dotfiles to an (independent) git remote, possibly with a separate branch
  for each of your projects
  
## Todos:

- [ ] Implement custom clone and push commands
- [ ] Automatically add .dotfiles/ and tracked file's entries to the .git/info/exclude of the
      actual project's git repository
      
## Basic usage:
 - `npm install -g git-dotfiles`
 - `cd <into_your_project_directory>`
 - `dotfiles init` (provide a remote repository if you like)
 - `dotfiles add .my_configuration` (you can use it like git)
 - `dotfiles status`
 - `dotfiles commit -m "Add configuration"`
 - `dotfiles push --set-upstream origin master:my_project` ('my_project' will be the remote branch.
    This will be simplified in the future)
 - In order to ignore the additional git root and the configuration files in the project's repository, run
   - `echo ".dotfiles/" >> .git/info/exclude`
   - `echo ".my_configuration" >> .git/info/exclude`
   - This will also be done automatically in the future
