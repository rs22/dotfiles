'use strict';

const { exec, spawn } = require('child_process');
const fs = require('fs');
const inquirer = require('inquirer');

const git = '/usr/bin/git';

const internals = {};

const GitContext = function(workdir) {

    this.workdir = workdir;

    this.initialize = (cb) => {

        this.getWorktreeRoot((err, worktreeRoot) => {

            if (err)
                return cb(new Error('Could not detect a git repository.'));

            this.worktreeRoot = worktreeRoot;
            this.dotfilesRoot = `${worktreeRoot}/.dotfiles`;

            cb();
        })
    }

    this.forward = () => {
        const childProc = spawn(git, 
            [`--git-dir=${this.dotfilesRoot}`, 
             `--work-tree=${this.worktreeRoot}`, 
             ...process.argv.slice(2)
            ], { cwd: process.cwd() });
        
        process.stdin.pipe(childProc.stdin);
        childProc.stdout.pipe(process.stdout);
        childProc.stderr.pipe(process.stderr);
        childProc.on('close', (code) => {
            process.exit(code);
        });
    }

    this.printDotfilesStatus = () => {

        console.log('Current dotfiles configuration:');
        console.log(`git worktree root: ${this.worktreeRoot}`);
        console.log(`dotfiles root: ${this.dotfilesRoot}`);
    }

    this.initDotfilesRoot = (cb) => {

        fs.access(this.dotfilesRoot, fs.constants.F_OK, (err) => {

            if (!err) {
                return cb(new Error('Dotfiles root directory already exists'));
            }

            // Collect user input
            const questions = [
                { type: 'input', name: 'remote', message: 'Please specify a git remote (optional)' },
                { type: 'input', name: 'branch', message: 'Please specify a remote branch name', when: a => a.remote },
            ];
            inquirer.prompt(questions).then(answers => {

                // Initialize git repository
                exec(`${git} init --bare ${this.dotfilesRoot}`, (err, stdout) => {
                
                    if (err) {
                        return cb(err);
                    }

                    exec(`${git} --git-dir=${this.dotfilesRoot} config --local status.showUntrackedFiles no` , (err, stdout) => {
                        
                        if (err) {
                            return cb(err);
                        }

                        if (answers.remote && answers.branch) {
                            exec(`${git} --git-dir=${this.dotfilesRoot} remote add origin ${answers.remote}` , (e, stdout) => {

                                if (e) {
                                    return cb(e);
                                }

                                // TODO: Save branch for later, if provided (e.g. in git config)

                                console.log(`Successfully initialized dotfiles repository in ${this.dotfilesRoot}`);
                            });
                        }
                        else {
                            console.log(`Successfully initialized dotfiles repository in ${this.dotfilesRoot}`);
                        }
                    });
                });

            }, e => cb(e));
        })
    }

    this.getWorktreeRoot = (cb) => {
        exec(`${git} rev-parse --show-toplevel`, (err, stdout) => cb(err, stdout.trim()));
    }
}

module.exports = GitContext;