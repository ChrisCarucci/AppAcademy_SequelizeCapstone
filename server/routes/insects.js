// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

const { Insect } = require('../db/models');
const { Op } = require("sequelize");

/**
 * INTERMEDIATE BONUS PHASE 2 (OPTIONAL) - Code routes for the insects
 *   by mirroring the functionality of the trees
 */
// Your code here

// List of all insects in the database
router.get('/', async (req, res, next) => {
  let insects = [];

  try {
    insects = await Insect.findAll({
      attributes: ['id', 'name', 'millimeters'],
      order: [ ['millimeters'] ]
    });

    if (insects.length > 0) {
      res.json(insects);
    } else {
      next({
        status: "not-found",
        message: "Could not find insects",
        details: "Insects not found"
      });
    }

  } catch (err) {
    next({
      status: "error",
      message: "Could not find insects",
      details: err.errors ? err.errors.map(item => item.message).join(',') : err.message
    });
  }
});

// Fetch an insect by id
router.get('/:id', async (req, res, next) => {
  let insect;

  try {
    insect = await Insect.findByPk(req.params.id);

    if (insect) {
      res.json(insect);
    } else {
      next({
        error: "not-found",
        message: `Could not find insect ${req.params.id}`,
        details: "Insect not found"
      })
    }
  } catch(err) {
    next({
      status: "error",
      message: `Could not find insect ${req.params.id}`,
      details: err.errors ? err.errors.map(item => item.message).join(',') : err.message
    });
  }
});

// Create an insect
router.post('/', async (req, res, next) => {
  try {
    const { name, description, fact, territory, millimeters } = req.body;

    const newInsect = Insect.create({
      name: name,
      description: description,
      fact: fact,
      territory: territory,
      millimeters: millimeters
    });

    res.json({
      status: "success",
      message: "Successfully created new insect",
      data: newInsect
    });

  } catch (err) {
    next({
      status: "error",
      message: 'Could not create new insect',
      details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
    });
  }
});

// Delete an insect
router.delete('/:id', async (req, res, next) => {
  try {
    const deletedInsect = await Insect.findByPk(req.params.id);

    if (deletedInsect) {
      deletedInsect.destroy();

      res.json({
        status: "success",
        message: `Successfully removed insect ${req.params.id}`,
      });
    } else {
      next({
        status: "not-found",
        message: `Could not remove insect ${req.params.id}`,
        details: "Insect not found"
      });
    }

  } catch (err) {
    next({
      status: "error",
      message: 'Could not delete insect',
      details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
    });
  }
});

// Update an insect
router.put('/:id', async (req, res, next) => {
  try {
    const { id, name, description, fact, territory, millimeters } = req.body;

    if ( id !== Number(req.params.id) ) {
      next({
        status: "error",
        message: `Could not update insect ${id}`,
        details: `URL id ${req.params.id} does not match input id ${id}`
      });
    }

    const updatedInsect = await Insect.findByPk(req.params.id);

    if (updatedInsect) {
      updatedInsect.update({
        name: name || updatedInsect.name,
        description: description || updatedInsect.description,
        fact: fact || updatedInsect.fact,
        territory: territory || updatedInsect.territory,
        millimeters: millimeters || updatedInsect.millimeters
      });

      res.json({
        status: "success",
        message: `Successfully updated insect ${id}`,
        data: updatedInsect
      });
    } else {
      next({
        status: "not-found",
        message: `Could not update insect ${id}`,
        details: "Tree not found"
      });
    }

  } catch (err) {
    next({
      status: "error",
      message: 'Could not update insect',
      details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
    });
  }
});

// Search for an insect by name
router.get('/search/:value', async (req, res, next) => {
  let insects = [];

  try {
    insects = await Insect.findAll({
      where: {
        name: {
          [Op.like]: `%${req.params.value}%`
        }
      }
    });

    if (insects.length > 0) {
      res.json(insects);
    } else {
      next({
        error: "not-found",
        message: `Could not find insects with name like ${req.params.value}`,
        details: "Insects not found"
      })
    }

  } catch (err) {
    next({
      error: "error",
      message: `Could not find insects with name like ${req.params.value}`,
      details: err.errors ? err.errors.map(item => item.message).join(',') : err.message,
    });
  }
});

// Export class - DO NOT MODIFY
module.exports = router;
