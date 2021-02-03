var template = `
    <section class="main-container" style="font-size: 17px; max-width: 700px; margin: 0 auto;">
        <h1 style="text-align: center">Ingreso total a recibir en el año</h1>
        <section style="text-align: right; width: 50%; margin: 0 auto;">
            {{#listTotalesAnio}}        
            <div>Mensualidad Total: {{totalMensualidadesAnio}}</div>
            <div>Donativo Total: {{totalDonativoAnio}}</div>
            <div>Matricula Total: {{totalMatriculaAnio}}</div>
            <div>Graduation Total: {{totalGraduationFeeAnio}}</div>
            <hr>
            <div>Suma Total: {{sumaTodosTotales}}</div>
            {{/listTotalesAnio}}
        </section>
    </section>
`;
var templateDataObject = {
    listTotalesAnio: []
};

var template = {
    templateStructure: template,
    templateData: templateDataObject
};

module.exports = template;