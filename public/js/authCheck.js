(async function() {
    try {
        const response = await fetch('/auth/check-session');
        const data = await response.json();

        if (!data.loggedIn) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
})();