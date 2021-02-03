var template = `
    <section class="main-container" style="font-size: 17px; max-width: 700px; margin: 0 auto;">
        <h1 style="text-align: center">Listado estudiantes por grado</h1>
        <h3 style="text-align: center">{{grado}}</h3>
        <section>
            <table  style="width: 100%; text-align: left;">
                <thead style="font-size:18px;">
                    <tr style="text-align: center;">
                        <th>Name Complete</th>
                        <th>Codigo Familia</th>                        
                    </tr>
                </thead>
                <tbody style="font-size:17px;">
                    {{#listStudents}}    
                    <tr style="text-align: center;">
                        <td>{{nameComplete}}</td>
                        <td>{{codigoFamilia}}</td>
                    </tr>
                    {{/listStudents}}
                </tbody>
            </table>
        </section>
    </section>
`;
var templateDataObject = {
    grado: "",
    listStudents: [],
    nameComplete: function () {
        return this.name + " " + this.middleName + ", " + this.lastName
    }
};

var template = {
    templateStructure: template,
    templateData: templateDataObject
};

module.exports = template;