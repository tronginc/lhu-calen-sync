async function getAllLhuEvents(studentId) {
    const response = await fetch("https://api.trongnc.com:3001/user/calendar?studentId=" + studentId);
    return response.json();
}