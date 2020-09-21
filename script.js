const authenticateAsync = () => {
    return gapi.auth2.getAuthInstance().signIn()
}

async function getCalender(studentId, events, rowIndex) {
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
            Ngay: '21/09/2020',
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
    return getCalender(studentId, events, rowIndex)
}

const loadClientAsync = async () => {
    console.log("Loading client...");
    gapi.client.setApiKey("AIzaSyBH-L4FN8eHqhihuETlel0TLriimhiEU-8");
    await gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest");
    console.log("Client loaded successfully!");
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

const getCalendarId = async () => {
    try {
        const calendars = await gapi.client.calendar.calendarList.list()
        const calendar = calendars.result.items.find(item => item.summary.toLowerCase() === "lịch học");
        if (calendar) {
            return calendar.id;
        }
        console.log("Could not find calendar name \"Lịch học\". Creating...");
        const newCalender = await gapi.client.calendar.calendars.insert({
            summary: "Lịch học"
        })
        return newCalender.result.id;
    }
    catch (error) {
        console.error("An error occurred", error);
    }
}

const loadGapiAsync = async () => {
    return new Promise((resolve, reject) => {
        gapi.load("client:auth2", () => {
            gapi.auth2.init({
                client_id: "406673141797-idjgps1huq10bpu6nd60eks51lgk963a.apps.googleusercontent.com",
                scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
                fetch_basic_profile: true,
                ux_mode: "redirect"
            })
                .then(resolve)
                .catch(reject)
        });
    })
}

const initAsync = async () => {
    try {
        console.log("Loading gapi...");
        await loadGapiAsync();
        console.log("Gapi loaded successfully!");
    }
    catch (error) {
        console.error("An error occurred", error);
        alert(error.details);
    }
}

const checkUserAsync = async () => {
    console.log("Checking user...");
    const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    if (!googleUser) {
        console.log("User did not sign in");
        return await authenticateAsync();
    }
    const profile = googleUser.getBasicProfile();
    console.log("Signed in as " + profile.getName(), googleUser);
}

const syncCalendar = async () => {
    await loadClientAsync();
    const calenderId = await getCalendarId();
}

async function bootstrap() {
    await initAsync();
    await checkUserAsync();
}
bootstrap();