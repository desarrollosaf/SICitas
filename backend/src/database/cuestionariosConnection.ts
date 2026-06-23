import { Sequelize } from "sequelize"

const sequelizeCuestionarios = new Sequelize('adminplem_citas', 'usr_citas', 'z1LhbiYGsTsvf1HfnSVP', {
    host: '192.168.36.53',
    dialect: 'mysql',
    define: {
        freezeTableName: true 
    }
})
export default sequelizeCuestionarios 
