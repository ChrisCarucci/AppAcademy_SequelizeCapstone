'use strict';

const { Insect, Tree } = require('../models');
const { Op } = require('sequelize');

const insectTrees = [
  {
    insect: { name: "Western Pygmy Blue Butterfly" },
    trees: [
      { tree: "General Sherman" },
      { tree: "General Grant" },
      { tree: "Lincoln" },
      { tree: "Stagg" },
    ],
  },
  {
    insect: { name: "Patu Digua Spider" },
    trees: [
      { tree: "Stagg" },
    ],
  },
]

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    for (let insectIdx = 0; insectIdx < insectTrees.length; insectIdx++) {
      let { insect, trees } = insectTrees[insectIdx];

      let targetInsect = await Insect.findOne({ where: insect });
      let targetTrees = await Tree.findAll({ where: { [Op.or]: trees } });

      await targetInsect.addTrees(targetTrees);
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     for (let insectIdx = 0; insectIdx < insectTrees.length; insectIdx++) {
      let { insect, trees } = insectTrees[insectIdx];

      let targetInsect = await Insect.findOne({ where: insect });
      let targetTrees = await Tree.findAll({ where: { [Op.or]: trees } });

      await targetInsect.removeTrees(targetTrees);
    }
  }
};
