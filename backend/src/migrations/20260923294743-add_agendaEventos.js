/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('agenda_eventos', 'hora_inicio', {
      type: Sequelize.TIME,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('agenda_eventos', 'hora_termino', {
      type: Sequelize.TIME,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('agenda_eventos', 'sede', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('agenda_eventos', 'horarios', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('agenda_eventos', 'table_horarios', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('agenda_eventos', 'total_citas_dia', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('agenda_eventos', 'limite_horario', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: false
    });
  
    await queryInterface.addColumn('agenda_eventos', 'organizador', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: false
    });
  
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('agenda_eventos', 'hora_inicio');
    await queryInterface.removeColumn('agenda_eventos', 'hora_termino');
    await queryInterface.removeColumn('agenda_eventos', 'sede');
    await queryInterface.removeColumn('agenda_eventos', 'horarios');
    await queryInterface.removeColumn('agenda_eventos', 'table_horarios');
    await queryInterface.removeColumn('agenda_eventos', 'total_citas_dia');
    await queryInterface.removeColumn('agenda_eventos', 'limite_horario');
    await queryInterface.removeColumn('agenda_eventos', 'organizador');
  }
};
