const figlet = require('figlet');
const clear = require('clear');
const chalk = require('chalk');
const inquirer = require('inquirer');
const bottomBar = new inquirer.ui.BottomBar();

// The master list of menu options (What will be asked with main menu)
const mainMenuOptions = [
    'one',
    'two',
    'quit'
];

// TODO: explain file
module.exports = {

    // TODO: add function header
    mainMenu: async (callback) => {
        clear();

        const figletConfig = {
            font: 'Doom',
            horizontalLayout: 'full'
        };
        
        console.log( chalk.green( figlet.textSync('Hello World!', figletConfig)));
        
        const menu = {
            type: 'list',
            name: 'menuOption',
            message: 'What would you like to do?',
            choices: mainMenuOptions
        };
        
        await inquirer.prompt(menu).then((answers) => {callback(answers)});
    },

    // TODO: add function header
    askPath: (ToWhat) => {

        const questions = [{
            type: 'input',
            name: 'path',
            message: ToWhat
        }];

        inquirer.prompt(questions);
    }

    // // TODO: add cuntion header
    // updateBottomBar: (newString) => {
    //     bottomBar.updateBottomBar("newString");
    // }

}