function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({
            scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
        })
        .then(function () {
                console.log("Sign-in successful");
            },
            function (err) {
                console.error("Error signing in", err);
            });
}

async function getCalender(studentId, calendars, rowIndex) {
    if (!calendars) {
        calendars = [];
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
            Ngay: '21/09/2020',
            RowIndex: rowIndex
        }),
        "method": "POST",
    });
    const data = await response.json();
    const newCalendars = JSON.parse(data.d[3]);
    calendars = [...calendars, ...newCalendars];
    if (newCalendars.length < 50) {
        return calendars;
    }
    rowIndex += 50;
    return getCalender(studentId, calendars, rowIndex)
}

function loadClient() {
    gapi.client.setApiKey("AIzaSyBH-L4FN8eHqhihuETlel0TLriimhiEU-8");
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest")
        .then(function () {
                console.log("GAPI client loaded for API");
            },
            function (err) {
                console.error("Error loading GAPI client for API", err);
            });
}
// Make sure the client is loaded and sign-in is complete before calling this method.
async function execute() {
    const calendars = await getCalender(document.getElementById("studentId").value);
    console.log("Total calendars:", calendars.length);
    const batch = gapi.client.newBatch();
    calendars.map((event) => {
        const data = {
            "calendarId": "primary",
            "sendNotifications": true,
            "sendUpdates": "all",
            "resource": {
                "start": {
                    "dateTime": moment(event.Ngay + " " + event.Tu.replace("<sup>h</sup>", ":"), 'DDMMYYYY HH:mm').toDate()
                },
                "end": {
                    "dateTime": moment(event.Ngay + " " + event.Den.replace("<sup>h</sup>", ":"), 'DDMMYYYY HH:mm').toDate()
                },
                "summary": event.TenMonHoc + " - " + event.TenPhong,
                "description": event.GiaoVien,
                "location": "Đại học Lạc Hồng " + event.TenCoSo
            }
        }
        console.log(data);
        batch.add(gapi.client.calendar.events.insert(data));
    })
    batch.then(() => console.log("Saved all"))
}

const getAll = async () => {
    const calendars = await gapi.client.calendar.events.list({
        calendarId: 'primary'
    });
    console.log(calendars);
    return calendars;
}

const deleteAll = async () => {
    const calendars = await getAll();
    const batch = gapi.client.newBatch();
    calendars.result.items.map(event => {
        console.log(event);
        batch.add(gapi.client.calendar.events.delete({
            eventId: event.id,
            calendarId: 'primary'
        }));
    })
    batch.then(() => console.log("Deleted all"))
}

gapi.load("client:auth2", function () {
    gapi.auth2.init({
        client_id: "406673141797-idjgps1huq10bpu6nd60eks51lgk963a.apps.googleusercontent.com"
    });
});