async function getAllLhuEvents(studentId, events, rowIndex) {
    if (!events) {
        events = [];
    }
    if (!rowIndex) {
        rowIndex = 50;
    }
    const response = await fetch("https://cors-anywhere.herokuapp.com/http://calen.lhu.edu.vn/AjaxPage/AjaxPage.aspx/LichSinhVien", {
        "headers": {
            "content-type": "application/json; charset=UTF-8",
        },
        "body": JSON.stringify({
            StudentID: studentId,
            Ngay: moment().format("DD/MM/YYYY"),
            RowIndex: rowIndex
        }),
        "method": "POST",
    });
    const data = await response.json();
    const newEvents = JSON.parse(data.d[3]);
    events = [...events, ...newEvents];
    if (newEvents.length < 50) {
        return events;
    }
    rowIndex += 50;
    return getAllLhuEvents(studentId, events, rowIndex)
}