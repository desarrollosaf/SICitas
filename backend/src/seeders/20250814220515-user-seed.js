'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password', 10);

    const users = [
      { id: uuidv4(), name: 'VCSAGM990220', email: 'martin.sanchez@congresoedomex.gob.mx', password: hashedPassword },
      { id: uuidv4(), name: 'VCROOT', email: 'rootVC@congresoedomex.gob.mx', password: hashedPassword },
      { id: uuidv4(), name: 'VCVOLUNTARIADO', email: 'voluntariadoVC@congresoedomex.gob.mx', password: hashedPassword },
      { id: uuidv4(), name: 'VCCONGRESO', email: 'congresoVC@congresoedomex.gob.mx', password: hashedPassword },
    ];

    await queryInterface.bulkInsert(
      'users',
      users.map(user => ({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
