#!/usr/bin/env node
'use strict';

const commandLineCommands = require('command-line-commands')

const GitContext = require('./gitContext');

const printError = (error) => {
    process.stderr.write('An error occurred:\n');
    process.stderr.write(error.message + '\n');
}

const ctx = new GitContext();
ctx.initialize((err) => {
    
    if (err) {
        return printError(err);
    }
    
    // Execute the specified command
    const validCommands = [ null, 'init', 'clone', 'ignore' ]
    try {
        const { command, argv } = commandLineCommands(validCommands);
        switch (command) {
            case null:
                ctx.printDotfilesStatus();
                break;
            case 'init':
                ctx.initDotfilesRoot(e => {
                    if (e) {
                        return printError(e);
                    }
                });
                break;
        }
    } catch (e) {
        ctx.forward();
    }
});
