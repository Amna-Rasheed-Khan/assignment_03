// Mock mongoose connection before importing app.js
const mongoose = require('mongoose');
jest.spyOn(mongoose, 'connect').mockResolvedValue(true);

const { Task } = require('../app');

describe('Task Model Test', () => {
    afterAll(async () => {
        // Close any open handles
        await mongoose.disconnect();
    });

    it('should create a task successfully', () => {
        const task = new Task({ title: 'Test Task' });
        expect(task.title).toBe('Test Task');
        expect(task.completed).toBe(false);
    });

    it('should require a title', () => {
        const task = new Task({});
        const err = task.validateSync();
        expect(err.errors.title).toBeDefined();
    });

    it('should set completed to false by default', () => {
        const task = new Task({ title: 'Another Task' });
        expect(task.completed).toBe(false);
    });
});
