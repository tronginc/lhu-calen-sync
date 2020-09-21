const checkUserAsync = async() => {
    console.log("Checking user...");
    const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    console.log(googleUser);
    if (!googleUser.isSignedIn()) {
        console.log("User did not sign in");
        gapi.signin2.render('login-button', {
            'longtitle': true,
            'theme': 'light',
            'width': 'auto',
            'height': 50,
        });
        return document.getElementById("not-signed-in").style.display = "block";

    }
    // gapi.auth2.getAuthInstance().disconnect();
    const profile = googleUser.getBasicProfile();
    document.getElementById("title").innerHTML = profile.getName();
    console.log("Signed in as " + profile.getName());
    document.getElementById("logout").innerHTML = "Đăng xuất";
    document.getElementById("logout").disabled = false;
    return document.getElementById("signed-in").style.display = "block";
}

const signOut = async() => {
    await gapi.auth2.getAuthInstance().signOut();
    window.location.reload();
}