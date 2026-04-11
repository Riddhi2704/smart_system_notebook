const mongoose = require('mongoose');
const Task = require('../models/Task');

// 🚀 HELPER FUNCTION FOR DYNAMIC DUE STATUS
const calculateDueStatus = (task) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  if (task.status === 'completed') return 'Completed';

  if (due < now) {
    const diff = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
    return `Overdue by ${diff} day${diff > 1 ? 's' : ''}`;
  } 
  
  if (due.getTime() === now.getTime()) {
    return 'Due Today';
  } 
  
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return `Due in ${diff} day${diff > 1 ? 's' : ''}`;
};

const getTasks = async (req, res, next) => {
  try {
    const { filter, sort } = req.query;
    let query = { userId: new mongoose.Types.ObjectId(req.user.id) };

    if (filter) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (filter === 'today') {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        query.dueDate = { $gte: now, $lt: tomorrow };
      } else if (filter === 'week') {
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        query.dueDate = { $gte: now, $lt: nextWeek };
      } else if (filter === 'overdue') {
        query.dueDate = { $lt: now };
        query.status = 'pending';
      } else if (filter === 'pending') {
        query.status = 'pending';
      } else if (filter === 'completed') {
        query.status = 'completed';
      }
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'dueDate') {
      sortOptions = { dueDate: 1 };
    }

    let tasks = await Task.find(query).sort(sortOptions);

    // 🚀 IN-MEMORY PRIORITY SORT (Robust fallback for custom weighted sorting)
    if (sort === 'priority') {
      const priorityWeights = { 'High': 3, 'Medium': 2, 'Low': 1 };
      tasks.sort((a, b) => {
        const weightA = priorityWeights[a.priority] || 0;
        const weightB = priorityWeights[b.priority] || 0;
        
        if (weightA !== weightB) {
          return weightB - weightA; // High (3) to Low (1)
        }
        
        // Secondary sort: Due Date (Nearest first)
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
    }

    const tasksWithStatus = tasks.map(task => {
      const taskObj = (typeof task.toObject === 'function') ? task.toObject() : task;
      taskObj.dueStatus = calculateDueStatus(taskObj);
      return taskObj;
    });

    res.json(tasksWithStatus);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Please provide a title');
    }

    if (!dueDate) {
      res.status(400);
      throw new Error('Please provide a due date');
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority: priority || 'Medium',
      userId: req.user.id
    });

    const taskObj = task.toObject();
    taskObj.dueStatus = calculateDueStatus(taskObj);

    res.status(201).json(taskObj);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.userId.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    const taskObj = updatedTask.toObject();
    taskObj.dueStatus = calculateDueStatus(taskObj);

    res.json(taskObj);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    if (task.userId.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await task.deleteOne();
    res.json({ id: req.params.id, message: 'Task removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
