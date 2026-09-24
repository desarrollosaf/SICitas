import { Model, DataTypes, CreationOptional, ForeignKey } from 'sequelize';
import sequelize from '../database/cuestionariosConnection';
import citasIssemym from './citas_issemym';
import citasLicencia from './citas_licencias';
import citasSalud from './citas_salud';
import CitaSep from './citas_sep';

class Tramites extends Model {
  declare id: CreationOptional<number>;
  declare evento_id: number;
  declare tramite: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}



Tramites.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    evento_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tramite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'tramites',
    timestamps: true,
  }
);

export default Tramites;