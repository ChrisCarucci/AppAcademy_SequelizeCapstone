// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import models - DO NOT MODIFY
const { Insect, Tree } = require('../db/models');
const { Op } = require("sequelize");
const { route } = require('./trees');

/**
 * PHASE 7 - Step A: List of all trees with insects that are near them
 *
 * Approach: Eager Loading
 *
 * Path: /trees-insects
 * Protocol: GET
 * Response: JSON array of objects
 *   - Tree properties: id, tree, location, heightFt, insects (array)
 *   - Trees ordered by the tree heightFt from tallest to shortest
 *   - Insect properties: id, name
 *   - Insects for each tree ordered alphabetically by name
 */
router.get('/trees-insects', async (req, res, next) => {
    let trees = [];

    trees = await Tree.findAll({
        attributes: ['id', 'tree', 'location', 'heightFt'],
        include: [{
            model: Insect,
            attributes: ['id', 'name'],
            required: true,
            through: { attributes: [] }
        }],
        order: [
            [Insect, 'name']
        ]
    });

    res.json(trees);
});

/**
 * PHASE 7 - Step B: List of all insects with the trees they are near
 *
 * Approach: Lazy Loading
 *
 * Path: /insects-trees
 * Protocol: GET
 * Response: JSON array of objects
 *   - Insect properties: id, name, trees (array)
 *   - Insects for each tree ordered alphabetically by name
 *   - Tree properties: id, tree
 *   - Trees ordered alphabetically by tree
 */
router.get('/insects-trees', async (req, res, next) => {
    let payload = [];

    const insects = await Insect.findAll({
        attributes: ['id', 'name', 'description'],
        order: [ ['name'] ],
    });

    for (let i = 0; i < insects.length; i++) {
        const insect = insects[i];

        const trees = await insect.getTrees({
            attributes: ['id', 'tree'],
            order: [ ['tree'] ],
            joinTableAttributes: []
        });

        payload.push({
            id: insect.id,
            name: insect.name,
            description: insect.description,
            trees: trees
        });
    }

    res.json(payload);
});

/**
 * ADVANCED PHASE 3 - Record information on an insect found near a tree
 *
 * Path: /associate-tree-insect
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Property: tree Object
 *     with id, name, location, height, size
 *   - Property: insect Object
 *     with id, name, description, fact, territory, millimeters
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully recorded information
 *   - Property: data
 *     - Value: object (the new tree)
 * Expected Behaviors:
 *   - If tree.id is provided, then look for it, otherwise create a new tree
 *   - If insect.id is provided, then look for it, otherwise create a new insect
 *   - Relate the tree to the insect
 * Error Handling: Friendly messages for known errors
 *   - Association already exists between {tree.tree} and {insect.name}
 *   - Could not create association (use details for specific reason)
 *   - (Any others you think of)
 */
// Your code here
router.post('/associate-tree-insect', async (req, res, next) => {
    try {
        const { tree, insect } = req.body;
        let targetTree, targetInsect, newTree, newInsect;

        if (!tree) {
            next({
                error: "missing part of request",
                messsage: "Could not find tree",
                details: "Tree missing in request"
            });
        } else if (!insect) {
            next({
                error: "missing part of request",
                messsage: "Could not find insect",
                details: "Insect missing in request"
            });
        }

        if (tree.id) {
            targetTree = await Tree.findByPk(tree.id);

            if (!targetTree) {
                next({
                    error: "not-found",
                    message: "Could not find tree",
                    details: "Tree not found"
                });
            }
        } else {
            newTree = await Tree.create(tree);
        }

        if (insect.id) {
            targetInsect = await Insect.findByPk(insect.id);

            if (!targetInsect) {
                next({
                    error: "not-found",
                    message: "Could not find insect",
                    details: "Insect not found"
                });
            }
        } else {
            newInsect = await Insect.create(insect);
        }

        if (insect.id && tree.id) {
            const target = await targetInsect.getTrees( { where: { id: tree.id } });

            if (target) {
                next({
                    error: "error",
                    message: 'Could not create association',
                    details: `Association already exists between ${targetTree.tree} and ${targetInsect.name}`
                })
            }
        }

        if (targetInsect) {
            targetTree ? targetInsect.addTrees([targetTree]) : targetInsect.addTrees([newTree]);
        } else {
            targetTree ? newInsect.addTrees([targetTree]) : newInsect.addTrees([newTree]);
        }

    } catch (err) {
        next({
            error: "error",
            message: "Could not create association",
            details: err.errors ? err.errors.map(item => item.message).join(',') : err.message
        });
    }
});

// Export class - DO NOT MODIFY
module.exports = router;
