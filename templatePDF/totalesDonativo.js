var template = `
    <section class="main-container" style="font-size: 17px; max-width: 700px; margin: 0 auto;">
        <h1 style="text-align: center">Donativos futuro y anual</h1>
        <section>
            <table  style="width: 100%; text-align: left;">
                <thead style="font-size:18px;">
                    <tr style="text-align: center;">
                        <th>Codigo Familia</th>
                        <th>Estudiantes</th>
                        <th>Grados</th>
                        <th>Donativo Anual</th>
                        <th>Donativo Futuro</th>
                    </tr>
                </thead>
                <tbody style="font-size:17px;">
                    {{#data}}    
                    <tr style="text-align: center;">
                        <td style="border-bottom: 1px solid #000;">{{codigoFamilia}}</td>
                        <td>
                            {{#students}}
                            <div style="white-space: nowrap;">* {{name}} {{lastName}} - {{grade.name}}</div>
                            {{/students}}
                        </td>
                        <td style="border-bottom: 1px solid #000;">{{donativoAnual}}</td>
                        <td style="border-bottom: 1px solid #000;">{{donativoFuturo}}</td>                        
                    </tr>
                    {{/data}}
                </tbody>
            </table>
        </section>
    </section>
`;
var templateDataObject = {
    listDonativo: null
};

var template = {
    templateStructure: template,
    templateData: templateDataObject
};

module.exports = template;