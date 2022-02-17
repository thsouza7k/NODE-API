const express = require('express');
const authMiddleware = require('../middlewares/auth');

const Project = require('../models/project');
const Task = require('../models/task');

const router = express.Router();

router.use(authMiddleware);

// rota de listagem 
router.get('/', async (req, res) => {
    try{
        const projects = await Project.find().populate('user');
        return res.send({projects});

    }catch(err){
        console.log(err)
        return res.status(400).send({error: 'Error ao listar os projetos'});
    }
});

router.get('/:projectsId', async (req, res) => {
    try{
        const project = await Project.findById(req.params.projectsId).populate('user');
        return res.send({project});

    }catch(err){
        console.log(err)
        return res.status(400).send({error: 'Error ao listar o projeto'});
    }
});

// Criação router 
router.post('/', async (req, res) => {
    try{
        const { title, description, tasks} = req.body;

        const project = await Project.create({title, description, user: req.userId});

        await Promise.all(tasks.map (async task => {
            const projectTask =  new Task({ ...task, project: project._id });       
     
          await  projectTask.save();
          
                project.tasks.push(projectTask);
            }));

        await project.save()
        
        return res.send({ project });
    }catch(err){
        
        return res.status(400).send({error: 'Error ao criar um novo projeto'});
    }
});

//Update Router
router.put('/:projectsId', async (req, res) => {
    try{
        const { title, description, tasks} = req.body;

        const project = await Project.findByIdAndUpdate(req.params.projectsId,{
            title, 
            description, 
            }, {new: true});

            project.tasks = [];
            await Task.remove({project: project._id});

        await Promise.all(tasks.map (async task => {
            const projectTask =  new Task({ ...task, project: project._id });       
     
          await  projectTask.save();
          
                project.tasks.push(projectTask);
            }));

        await project.save()
        
        return res.send({ project });
    }catch(err){
        
        return res.status(400).send({error: 'Error ao atualizar o projeto'});
    }
});

//Delte Router
router.delete('/:projectsId', async (req, res) => {
    try{
        await Project.findByIdAndRemove(req.params.projectsId);
        return res.send("Projeto removido com sucesso");

    }catch(err){
        return res.status(400).send({error: 'Error ao deletar o projeto'});
    }
});

module.exports = app => app.use('/projects', router)