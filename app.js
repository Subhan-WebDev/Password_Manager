const launchBtn = document.getElementById('launchBtn');
const loginSection = document.getElementById('loginSection');
const signupSection = document.getElementById('signupSection');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn'); // Corrected from SignupBtn to signupBtn

// Function to apply animation
const applyAnimation = (element, animationName) => {
    element.style.animation = `${animationName} 0.5s ease-in-out forwards`;
};

// Show the login section and hide signup section
launchBtn.addEventListener('click', () => {
    loginSection.classList.remove('hidden');
    signupSection.classList.add('hidden');
    applyAnimation(signupSection, 'hide');
    loginSection.classList.remove('hidden');
});

// Switch to the signup section
loginBtn.addEventListener('click', () => {
    applyAnimation(loginSection, 'hide');
    setTimeout(() => {
        loginSection.classList.add('hidden');
        signupSection.classList.remove('hidden');
        applyAnimation(signupSection, 'show');
    }, 500); // Match the duration of the animation
});

// Switch back to the login section
signupBtn.addEventListener('click', () => {
    applyAnimation(signupSection, 'hide');
    setTimeout(() => {
        signupSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        applyAnimation(loginSection, 'show');
    }, 500); // Match the duration of the animation
});
