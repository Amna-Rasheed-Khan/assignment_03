const mongoose = require('mongoose');
const { Task } = require('../app');

describe('Task Model Test', () => {
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
});
