/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('agenda_eventos', 'genero', {
      type: Sequelize.STRING(1),
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('agenda_eventos', 'genero');
  }
};
