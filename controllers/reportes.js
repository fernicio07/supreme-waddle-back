'use strict'

//var fs = require('fs');
var htmlPdf = require('html-pdf');
var MushtacheModule = require('mustache');
var studentsForGrade = require('../templatePDF/studentsForGrade.js');
var totalesAnio = require('../templatePDF/totalesAnio.js');
var totalesPeriodo = require('../templatePDF/totalesPeriodo.js');
//var totalesDonativo = require('../templatePDF/totalesDonativo.js');

var controller = {

    getReportStudentsForGrade: async(req, res)  => {        
        var params = req.body;

        studentsForGrade.templateData.listStudents = params;
        studentsForGrade.templateData.grado = params[0].grade.name;

        //var templatetype = 'sales';
        var options = {
            format: 'Letter',
            //directory: "../../tmp",
            "border": {
                "top": "1in", // default is 0, units: mm, cm, in, px
                "right": "0.5in",
                "bottom": "1in",
                "left": "0.5in"
            }
        };
        
        //console.log('Template Type :', templatetype);
        var htmlContent = MushtacheModule.render(studentsForGrade.templateStructure, studentsForGrade.templateData);
        htmlPdf.create(htmlContent, options).toBuffer(function(err, rest) {
            var filename = 'report-students-grade';
            filename = encodeURIComponent(filename) + '.pdf'
            return res.status(200).send({
                rest,
                filename
            });
        });
    },

    getReportTotalesAnio: async(req, res) => {
        var params = req.body;

        totalesAnio.templateData.listTotalesAnio = params;

        var options = {
            format: 'Letter',
            //directory: "../../tmp",
            "border": {
                "top": "1in", // default is 0, units: mm, cm, in, px
                "right": "0.5in",
                "bottom": "1in",
                "left": "0.5in"
            }
        };
        
        var htmlContent = MushtacheModule.render(totalesAnio.templateStructure, totalesAnio.templateData);
        htmlPdf.create(htmlContent, options).toBuffer(function(err, rest) {
            var filename = 'report-total-anual';
            filename = encodeURIComponent(filename) + '.pdf'
            return res.status(200).send({
                rest,
                filename
            });
        });
    },

    getReportTotalesPeriodo: async(req, res) => {
        var params = req.body;

        totalesPeriodo.templateData.listTotalesPeriodo = params;

        var options = {
            format: 'Letter',
            //directory: "../../tmp",
            "border": {
                "top": "1in", // default is 0, units: mm, cm, in, px
                "right": "0.5in",
                "bottom": "1in",
                "left": "0.5in"
            }
        };
        
        var htmlContent = MushtacheModule.render(totalesPeriodo.templateStructure, totalesPeriodo.templateData);
        htmlPdf.create(htmlContent, options).toBuffer(function(err, rest) {
            var filename = 'report-total-periodo';
            filename = encodeURIComponent(filename) + '.pdf'
            return res.status(200).send({
                rest,
                filename
            });
        });
    },

    getReportDonativos: async(req, res) => {
        var params = req.body;

        var studenF = [];
        for (const iterator of params) {
            let item = {};
            item.codigoFamilia = iterator.codigoFamilia;
            item.donativoAnual = iterator.estadoCuenta[0].donativoAnual
            item.donativoFuturo = iterator.estadoCuenta[0].donativoFuturo
            item.students = iterator.students;
            studenF.push(item);
        }

        var templateHTML = `
            <section class="main-container" style="font-size: 14px; max-width: 700px; margin: 0 auto;">
                <h1 style="text-align: center">Donativos futuro y anual</h1>
                <section>
                    <table  style="width: 100%; text-align: left;">
                        <thead style="font-size:14px;">
                            <tr style="text-align: center;">
                                <th>Codigo Familia</th>
                                <th>Estudiante</th>
                                <th>Grado</th>
                                <th>Donativo Anual</th>
                                <th>Donativo Futuro</th>
                            </tr>
                        </thead>
                        <tbody style="font-size:14px;">
                            {{#data}}    
                            <tr>
                                <td style="border-bottom: 1px solid #000; text-align: center;">{{codigoFamilia}}</td>
                                <td style="border-bottom: 1px solid #000;">
                                    
                                    <ol style="margin:0">
                                        {{#students}}
                                        <li style="white-space: nowrap;">{{name}} {{lastName}}</li>
                                        {{/students}}
                                    </ol>
                                    
                                </td>
                                <td style="border-bottom: 1px solid #000;">
                                    {{#students}}
                                    <div style="white-space: nowrap;"> {{grade.name}}</div>
                                    {{/students}}
                                </td>
                                <td style="border-bottom: 1px solid #000; text-align: center;">{{donativoAnual}}</td>
                                <td style="border-bottom: 1px solid #000; text-align: center;">{{donativoFuturo}}</td>                        
                            </tr>
                            {{/data}}
                        </tbody>
                    </table>
                </section>
            </section>
        `;
        var templateDataObject = {
            data: studenF
        };

        var options = {
            format: 'Letter',
            //directory: "../../tmp",
            "border": {
                "top": "1in", // default is 0, units: mm, cm, in, px
                "right": "0.5in",
                "bottom": "1in",
                "left": "0.5in"
            }
        };
        var htmlContent = MushtacheModule.render(templateHTML, templateDataObject);
        
        htmlPdf.create(htmlContent, options).toBuffer(function(err, rest) {
            var filename = 'reporte-donativos';
            filename = encodeURIComponent(filename) + '.pdf'
            return res.status(200).send({
                rest,
                filename
            });
        });
    },

    getReportDeposito: async (req, res) => {
        var params = req.body;

        var templateHTML = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <title>Example 1</title>
                    <style>
                        .clearfix:after {
                            content: "";
                            display: table;
                            clear: both;
                        }
                        
                        a {
                            color: #5D6975;
                            text-decoration: underline;
                        }
                        
                        body {
                            position: relative;
                            width: 100%;  
                            height: 29.7cm; 
                            margin: 0 auto; 
                            color: #001028;
                            background: #FFFFFF; 
                            font-family: Arial, sans-serif; 
                            font-size: 12px; 
                            font-family: Arial;
                        }
                        
                        header {
                            padding: 10px 0;
                            margin-bottom: 30px;
                        }
                        
                        h1 {
                            border-top: 1px solid  #5D6975;
                            border-bottom: 1px solid  #5D6975;
                            color: #5D6975;
                            font-size: 2.4em;
                            line-height: 1.4em;
                            font-weight: normal;
                            text-align: center;
                            margin: 0 0 20px 0;
                            background: url(dimension.png);
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            border-spacing: 0;
                            margin-bottom: 20px;
                        }
                        
                        table tr:nth-child(2n-1) td {
                            background: #F5F5F5;
                        }
                        
                        table th {
                            padding: 5px 20px;
                            color: #5D6975;
                            border-bottom: 1px solid #C1CED9;
                            white-space: nowrap;        
                            font-weight: normal;
                        }
                        
                        table .service {
                            text-align: left;
                            white-space: nowrap;
                        }
                        
                        table td,
                        table th {
                            padding: 10px 20px;
                            text-align: right;
                        }
                        
                        table td.service {
                            vertical-align: top;
                        }
                        
                        table td.unit,
                        table td.qty,
                        table td.total {
                            font-size: 1.2em;
                        }
                        
                        table td.grand {
                            border-top: 1px solid #5D6975;;
                        }
                    </style>
                </head>
                <body>
                {{#data}}
                    <header class="clearfix">
                        <h1>Deposito Num. {{numeroDeposito}}</h1>
                    </header>
                    <main style="margin-bottom: 100px;">
                        <table>
                            <thead>
                                <tr>
                                    <th class="service">NOMBRE</th>
                                    <th>TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="service">INSTRUCCION</td>
                                    <td class="total">$ {{totalMensualidad}}</td>
                                </tr>
                                <tr>
                                    <td class="service">DONATIVO</td>
                                    <td class="total">$ {{totalDonativo}}</td>
                                </tr>
                                <tr>
                                    <td class="service">GRADUACION</td>
                                    <td class="total">$ {{totalGraduacion}}</td>
                                </tr>
                                <tr>
                                    <td class="service">MATRICULA</td>
                                    <td class="total">$ {{totalMatricula}}</td>
                                </tr>                                
                                <tr>
                                    <td class="service">ANUARIO</td>
                                    <td class="total">$ {{totalAnuario}}</td>
                                </tr>
                                <tr>
                                    <td class="service">SEGURIDAD</td>
                                    <td class="total">$ {{totalSeguridad}}</td>
                                </tr>
                                <tr>
                                    <td class="service">MANTENIMIENTO</td>
                                    <td class="total">$ {{totalMantenimiento}}</td>
                                </tr>
                                <tr>
                                    <td class="service">SEGURO</td>
                                    <td class="total">$ {{totalSeguro}}</td>
                                </tr>
                                <tr>
                                    <td class="service">TECNOLOGIA EDUCATIVA</td>
                                    <td class="total">$ {{totalTecnologia}}</td>
                                </tr>
                                <tr>
                                    <td class="service">LIGROS DIGITALES</td>
                                    <td class="total">$ {{totalLibrosDigitales}}</td>
                                </tr>
                                <tr>
                                    <td class="service">CUIDO</td>
                                    <td class="total">$ {{totalCuido}}</td>
                                </tr>
                                <tr>
                                    <td class="service">RECARGOS</td>
                                    <td class="total">$ {{totalRecargos}}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" class="grand total">
                                        <span style="margin-right: 50px">TOTAL DE DEPOSITO</span>
                                        <span>$ {{totalDeposito}}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </main>

                    <main>
                        <h1>Pagos Seleccionados</h1>
                        <table>
                            <thead>
                                <tr>
                                    <th class="service" style="text-align: center;">COD. FAM</th>
                                    <th class="service" style="text-align: center;">INS</th>
                                    <th class="service" style="text-align: center;">DON</th>
                                    <th class="service" style="text-align: center;">CUIDO</th>
                                    <th class="service" style="text-align: center;">GRAD</th>
                                    <th class="service" style="text-align: center;">MAT</th>
                                    <th class="service" style="text-align: center;">SEGURO</th>
                                    <th class="service" style="text-align: center;">SEGURIDAD</th>
                                    <th class="service" style="text-align: center;">TEC</th>
                                    <th class="service" style="text-align: center;">MANT</th>
                                    <th class="service" style="text-align: center;">ANUARIO</th>
                                    <th class="service" style="text-align: center;">LIB. DIGITALES</th>
                                    <th class="service" style="text-align: center;">RECARGO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {{#pagos}}
                                <tr>

                                    <td class="service" style="text-align: center;">{{codigoFamilia}}</td>
                                    <td class="service" style="text-align: center;">$ {{mensualidadInstruccionPagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoDonationFeePagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoTotalCuidoPagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoGraduationFeePagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoTotalMatriculaStudentsPagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoTotalSeguroStudentsPagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoSecurityFeePagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoTechnologyFeePagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoMaintenanceFeePagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoYearbookPagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoLibrosDigitalesPagado}}</td>
                                    <td class="service" style="text-align: center;">$ {{montoRecargoPagado}}</td>
                                </tr>
                                {{/pagos}}
                                <tr>
                                    <td class="service" style="text-align: center;">TOTALES</td>
                                    <td class="service" style="text-align: center;">$ {{totalMensualidad}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalDonativo}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalCuido}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalGraduacion}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalMatricula}}</td>                                    
                                    <td class="service" style="text-align: center;">$ {{totalSeguro}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalSeguridad}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalTecnologia}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalMantenimiento}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalAnuario}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalLibrosDigitales}}</td>
                                    <td class="service" style="text-align: center;">$ {{totalRecargos}}</td>
                                </tr>
                            </tbody>
                        </table>
                    </main>
                {{/data}} 
                </body>
            </html>
        `;

        var templateDataObject = {
            data: params
        };

        var options = {
            format: 'Letter',
            paginationOffset: 1,       // Override the initial pagination number
            "header": {
                "height": "25mm",
            },
            "height": "600px",        // allowed units: mm, cm, in, px
            "width": "1000px",
            //directory: "../../tmp",
        };
        var htmlContent = MushtacheModule.render(templateHTML, templateDataObject);
        
        htmlPdf.create(htmlContent, options).toBuffer(function(err, rest) {
            var filename = 'reporte-depositos';
            filename = encodeURIComponent(filename) + '.pdf'
            return res.status(200).send({
                rest,
                filename
            });
        });
    }
}

module.exports = controller;