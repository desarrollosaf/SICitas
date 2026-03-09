import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminplem_vacunacion', 'usr_vacunacion', 'CFxV9IWBwUuu6KSFEUh0', {
    host: '192.168.36.53',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }
})
export default sequelizeCuestionarios 
