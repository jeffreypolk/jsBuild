
var model = {
    AccountNumber: '12345',
    ClosingDate: new Date('2017-04-01'),
    RequestedAmount: 25000,
    SubProductId: 2,
    formatDate: function (date) {
        var day = ('0' + date.getDate()).slice(-2);
        var month = ('0' + (date.getMonth() + 1)).slice(-2);
        return date.getFullYear() + '-' + (month) + '-' + (day);
    }
}



$(document).ready(function () {

    $('#txtAccountNumber').val(model.AccountNumber).change(function () { model.AccountNumber = $(this).val(); evalExpression(); });
    $('#txtClosingDate').val(model.formatDate(model.ClosingDate)).change(function () { model.ClosingDate = $(this).val(); evalExpression(); });
    $('#txtRequestedAmount').val(model.RequestedAmount).change(function () { model.RequestedAmount = $(this).val(); evalExpression(); });
    $('#ddlSubProductId').val(model.SubProductId).change(function () { model.SubProductId = $(this).val(); evalExpression(); });

});