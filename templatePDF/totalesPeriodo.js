var template = `
    <section class="main-container" style="font-size: 17px; max-width: 700px; margin: 0 auto;">
        <h1 style="text-align: center">Ingreso total a recibir en el periodo</h1>
        <section style="text-align: right; width: 50%; margin: 0 auto;">
            {{#listTotalesPeriodo}}        
            <div>Instruccion Total: {{instruccion}}</div>
            <div>Donativo Total: {{donativo}}</div>            
            <div>Graduation Total: {{graduacion}}</div>
            <div>Matricula Total: {{matricula}}</div>
            <div>Anuario Total: {{anuario}}</div>
            <div>Mantenimiento Total: {{mantenimiento}}</div>
            <div>Seguridad Total: {{seguridad}}</div>
            <div>Tecnologia Total: {{tecnologia}}</div>
            <hr>
            <div>Suma Total: {{total}}</div>
            {{/listTotalesPeriodo}}
        </section>
    </section>
`;
var templateDataObject = {
    listTotalesPeriodo: []
};

var template = {
    templateStructure: template,
    templateData: templateDataObject
};

module.exports = template;