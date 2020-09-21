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

const loadClientAsync = async () => {
    console.log("Loading client...");
    gapi.client.setApiKey("AIzaSyBH-L4FN8eHqhihuETlel0TLriimhiEU-8");
    await gapi.client.load("https://content.googleapis.com/discovery/v1/apis/calendar/v3/rest");
    console.log("Client loaded successfully!");
}

const initAsync = async () => {
    try {
        console.log("Loading gapi...");
        await loadGapiAsync();
        console.log("Gapi loaded successfully!");
    } catch (error) {
        console.error("An error occurred", error);
        alert(error.details);
    }
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
    } catch (error) {
        console.error("An error occurred", error);
    }
}

const getAllItems = async () => {
    const calenderId = await getCalendarId();
    const calendar = await gapi.client.calendar.events.list({
        calendarId: "primary",
        maxResults: 999999999
    });
    console.log(calendar.result.items);
    return {
        calenderId,
        calendar
    };
}

const deleteAll = async () => {
    const {
        calendarId,
        calendar
    } = await getAllItems();
    if (!calendar.result.items.length) {
        return console.log("No calendars found. Skipping...")
    }
    const batch = gapi.client.newBatch();
    calendar.result.items.map(event => {
        batch.add(gapi.client.calendar.events.delete({
            eventId: event.id,
            calendarId: calendarId
        }));
    })
    batch.then(() => console.log("Deleted all"))
}

const syncCalendarAsync = async () => {
    const calenderId = await getCalendarId();
    const userId = await document.getElementById("studentId").value;
    if (!/^\d{6}$/gm.test(userId)) {
        return alert("Please enter valid studentId");
    }
    const events = await getAllLhuEvents(userId);
    events.map((event) => {
        const data = {
            "calendarId": calenderId,
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

async function bootstrap() {
    await initAsync();
    await checkUserAsync();
    await loadClientAsync();
}
bootstrap();