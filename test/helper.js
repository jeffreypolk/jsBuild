
var model = {
    AccountNumber: '12345',
    BirthDate: new Date('1934-08-18'),
    ClosingDate: new Date('2017-04-01'),
    Name: 'Roberto Clemente',
    RequestedAmount: 25000,
    SubProductId: 2,
    Term: 60,
    formatDate: function (date) {
        var day = ('0' + date.getDate()).slice(-2);
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        return date.getFullYear() + '-' + (month) + '-' + (day);
    }
}

var fields = [{
    id: 'AccountNumber',
    name: 'Account Number',
    type: 'string'
}, {
    id: 'BirthDate',
    name: 'Birth Date',
    type: 'date'
}, {
    id: 'ClosingDate',
    name: 'Closing Date',
    type: 'date'
}, {
    id: 'Name',
    name: 'Name',
    type: 'string'
}, {
    id: 'RequestedAmount',
    name: 'Requested Amount',
    type: 'money'
}, {
    id: 'SubProductId',
    name: 'Sub Product',
    type: 'integer',
    values: [{
        value: 1,
        display: 'Credit Card'
    }, {
        value: 2,
        display: 'Auto Loan'
    }]
}, {
    id: 'Term',
    name: 'Term',
    type: 'integer'
}];

$(document).ready(function () {

    $('#txtAccountNumber').val(model.AccountNumber).change(function () { model.AccountNumber = $(this).val(); evalExpression(); });
    $('#txtBirthDate').val(model.formatDate(model.BirthDate)).change(function () { model.BirthDate = $(this).val(); evalExpression(); });
    $('#txtClosingDate').val(model.formatDate(model.ClosingDate)).change(function () { model.ClosingDate = $(this).val(); evalExpression(); });
    $('#txtName').val(model.Name).change(function () { model.Name = $(this).val(); evalExpression(); });
    $('#txtRequestedAmount').val(model.RequestedAmount).change(function () { model.RequestedAmount = $(this).val(); evalExpression(); });
    $('#ddlSubProductId').val(model.SubProductId).change(function () { model.SubProductId = parseInt($(this).val()); evalExpression(); });
    $('#txtTerm').val(model.Term).change(function () { model.Term = $(this).val(); evalExpression(); });

});