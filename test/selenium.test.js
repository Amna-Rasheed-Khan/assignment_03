const { Builder, By, until } = require('selenium-webdriver');

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

describe('Selenium UI Tests', () => {
    let driver;

    beforeAll(async () => {
        // We use a remote selenium standalone chrome in Docker
        // or local if not provided
        const seleniumHubUrl = process.env.SELENIUM_HUB_URL || 'http://localhost:4444/wd/hub';
        driver = await new Builder()
            .forBrowser('chrome')
            .usingServer(seleniumHubUrl)
            .build();
    }, 30000);

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    it('Test Case 1: Should load the page and verify title', async () => {
        await driver.get(APP_URL);
        const title = await driver.getTitle();
        expect(title).toBe('Task Manager - Assignment 3');
    }, 15000);

    it('Test Case 2: Should add a new task successfully', async () => {
        await driver.get(APP_URL);
        
        const input = await driver.findElement(By.id('taskInput'));
        await input.sendKeys('Selenium Test Task');
        
        const btn = await driver.findElement(By.id('addTaskBtn'));
        await btn.click();
        
        // Wait until task is added and displayed
        await driver.sleep(2000);
        
        const tasks = await driver.findElements(By.css('#taskList li'));
        let found = false;
        for (let task of tasks) {
            let text = await task.getText();
            if (text === 'Selenium Test Task') {
                found = true;
                break;
            }
        }
        expect(found).toBe(true);
    }, 15000);
});
