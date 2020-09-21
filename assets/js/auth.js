const checkUserAsync = async () => {
    console.log("Checking user...");
    const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
    console.log(googleUser);
    if (!googleUser.isSignedIn()) {
        console.log("User did not sign in");
        return await gapi.auth2.getAuthInstance().signIn();
    }
    const profile = googleUser.getBasicProfile();
    console.log("Signed in as " + profile.getName());
}

const signOut = async () => {
    return gapi.auth2.getAuthInstance().signOut();
}