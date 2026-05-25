const textElement = document.querySelector(".typewriter-text");
const words = ["BSIT STUDENT", "Web Developer", "Cybersecurity Enthusiast"];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100; // Normal typing speed
let pauseTime = 2000;  // Pause time after typing a full word

function typeEffect() {
    if (!textElement) return;

    const currentWord = words[wordIndex];

    if (isDeleting) {
        textElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentWord.length) {
        // When the full word is typed, wait for a moment before deleting
        isDeleting = true;
        setTimeout(typeEffect, pauseTime);
        return; // Stop the function from executing further
    } 

    if (isDeleting && charIndex === 0) {
        // When word is fully deleted, move to the next word
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
    }

    setTimeout(typeEffect, isDeleting ? 50 : typingSpeed);
}

// Start typing when the page loads
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(typeEffect, 1000);
    
    // Demo reel modal functionality
    const modal = document.getElementById("demo-reel-modal");
    const demoReelTrigger = document.getElementById("demo-reel-trigger");
    const closeModal = document.querySelector(".close-modal");
    const video = document.getElementById("demo-video");
    
    if (demoReelTrigger && modal) {
        // Open modal when clicking on the demo reel text
        demoReelTrigger.addEventListener("click", function() {
            modal.style.display = "block";
            setTimeout(() => {
                modal.classList.add("show");
            }, 10);
            if (video) {
                video.play(); // Auto-play when opened
            }
        });
        
        // Close modal when clicking X button
        if (closeModal) {
            closeModal.addEventListener("click", function() {
                modal.classList.remove("show");
                setTimeout(() => {
                    modal.style.display = "none";
                    if (video) {
                        video.pause(); // Pause video when closed
                        video.currentTime = 0; // Reset video to beginning
                    }
                }, 300);
            });
        }
        
        // Close modal when clicking outside the video
        window.addEventListener("click", function(event) {
            if (event.target === modal) {
                modal.classList.remove("show");
                setTimeout(() => {
                    modal.style.display = "none";
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }
                }, 300);
            }
        });
    }
});

function hamburg() {
    document.querySelector('.dropdown').style.transform = 'translateX(0)';
}

function cancel() {
    document.querySelector('.dropdown').style.transform = 'translateX(-100%)';
}

// Contact Form AJAX Submission
document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    const successModal = document.getElementById("success-modal");
    
    if (contactForm && successModal) {
        const closeBtn = successModal.querySelector(".close-success-btn");
        
        contactForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Prevent standard redirect
            
            // Validation Logic
            let isValid = true;
            
            const nameInput = document.getElementById("nameInput");
            const emailInput = document.getElementById("emailInput");
            const messageInput = document.getElementById("messageInput");
            
            const nameError = document.getElementById("nameError");
            const emailError = document.getElementById("emailError");
            const messageError = document.getElementById("messageError");
            
            // Reset errors
            nameInput.classList.remove("input-error");
            emailInput.classList.remove("input-error");
            messageInput.classList.remove("input-error");
            nameError.textContent = "";
            emailError.textContent = "";
            messageError.textContent = "";
            
            // Name validation (must contain a comma)
            if (!nameInput.value.includes(",")) {
                nameError.textContent = "Please use format: Surname, Name";
                nameInput.classList.add("input-error");
                isValid = false;
            } else if (nameInput.value.trim().length < 3) {
                nameError.textContent = "Name is too short.";
                nameInput.classList.add("input-error");
                isValid = false;
            }
            
            // Email validation (only @gmail.com)
            const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
            if (!emailPattern.test(emailInput.value.trim())) {
                emailError.textContent = "Please enter a valid @gmail.com address.";
                emailInput.classList.add("input-error");
                isValid = false;
            }
            
            // Message validation
            if (messageInput.value.trim().length < 10) {
                messageError.textContent = "Message must be at least 10 characters.";
                messageInput.classList.add("input-error");
                isValid = false;
            }
            
            if (!isValid) return;
            
            const btn = contactForm.querySelector(".submit-btn");
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending Code... <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            fetch('/api/send-otp', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                
                // Show OTP Modal
                const otpModal = document.getElementById("otp-modal");
                otpModal.classList.add("show");
                
                const verifyBtn = document.getElementById("verifyOtpBtn");
                const cancelBtn = otpModal.querySelector(".close-otp-btn");
                const otpInput = document.getElementById("otpInput");
                const otpError = document.getElementById("otpError");
                
                otpInput.value = "";
                otpError.textContent = "";

                // Handle Cancel
                const closeOtp = () => otpModal.classList.remove("show");
                cancelBtn.onclick = closeOtp;

                // Handle Verify
                verifyBtn.onclick = function() {
                    const code = otpInput.value.trim();
                    if (code.length !== 6) {
                        otpError.textContent = "Please enter the 6-digit code";
                        return;
                    }
                    
                    verifyBtn.innerHTML = 'Verifying... <i class="fa-solid fa-spinner fa-spin"></i>';
                    verifyBtn.disabled = true;

                    fetch('/api/verify-otp', {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name, email, message,
                            code, hash: data.hash, expiresAt: data.expiresAt
                        })
                    })
                    .then(res => res.json())
                    .then(verifyData => {
                        if (verifyData.error) {
                            otpError.textContent = verifyData.error;
                        } else {
                            // Success!
                            otpModal.classList.remove("show");
                            successModal.classList.add("show");
                            contactForm.reset();
                        }
                    })
                    .catch(() => {
                        otpError.textContent = "Verification failed. Please try again.";
                    })
                    .finally(() => {
                        verifyBtn.innerHTML = 'Verify & Send';
                        verifyBtn.disabled = false;
                    });
                };
            })
            .catch(error => {
                alert(error.message || "Oops! There was a problem sending the verification code");
            })
            .finally(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        });

        // Close success modal logic
        const closeSuccess = () => successModal.classList.remove("show");
        if (closeBtn) closeBtn.addEventListener("click", closeSuccess);
        
        window.addEventListener("click", function(event) {
            if (event.target === successModal) closeSuccess();
        });
    }
});
