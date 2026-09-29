
import CitasGeneral from "./citas_general";
import agendaEventos from "./eventos";
import Sede from "./sedes";
import Tramites from "./tramites";

agendaEventos.hasMany(Tramites,{
    foreignKey: "evento_id",
    as: "m_tramites"
});

agendaEventos.hasMany(CitasGeneral,{
    foreignKey: "evento_id",
    as: "m_citasG"
});

agendaEventos.belongsTo(Sede, { foreignKey: "sede", as: "mSede" });


CitasGeneral.belongsTo(agendaEventos, { foreignKey: "evento_id", as: "mEvento" });
