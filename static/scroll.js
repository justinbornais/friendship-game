const container = document.getElementById('board-wrapper');
const svg = document.getElementById("board");

let isDragging = false, isPinching = false;
let startX, startY, prevX, prevY, scrollLeft, scrollTop;
let velocityX = 0, velocityY = 0;
let momentumAnimation;
let scale = 1;
let startDistance = 0; // Initial distance between two touch points.

function pressDown(e) {
    isDragging = true;
    container.style.cursor = 'grabbing';
    startX = e.pageX - container.offsetLeft;
    startY = e.pageY - container.offsetTop;
    prevX = e.pageX;
    prevY = e.pageY;
    scrollLeft = container.scrollLeft;
    scrollTop = container.scrollTop;

    // Stop any ongoing momentum animation.
    velocityX = 0;
    velocityY = 0;
    cancelAnimationFrame(momentumAnimation);
}

function pressMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const y = e.pageY;
    const deltaX = x - startX;
    const deltaY = y - startY;
    container.scrollLeft = scrollLeft - deltaX;
    container.scrollTop = scrollTop - deltaY;
    velocityX = x - prevX;
    velocityY = y - prevY;
    prevX = x;
    prevY = y;
}

function pressUp(e) {
    if (!isDragging) return;

    isDragging = false;
    container.style.cursor = 'grab';

    applyMomentum(velocityX, velocityY);
}

container.addEventListener('mousedown', pressDown);
document.addEventListener('mousemove', pressMove);
document.addEventListener('mouseup', pressUp);

// Momentum effect for scrolling.
function applyMomentum(initialVelocityX, initialVelocityY) {
    const friction = 0.85; // Friction factor to slow down scrolling.
    const stopThreshold = 0.5; // Minimum speed to stop scrolling.

    function animate() {
        // Apply friction to reduce velocity.
        initialVelocityX *= friction;
        initialVelocityY *= friction;

        // Update scroll position based on current velocity.
        container.scrollLeft -= initialVelocityX;
        container.scrollTop -= initialVelocityY;

        // If velocity is still above the threshold, continue the animation.
        if (Math.abs(initialVelocityX) > stopThreshold || Math.abs(initialVelocityY) > stopThreshold) {
            momentumAnimation = requestAnimationFrame(animate);
        }
    }

    animate();
}

// Helper function to get the distance between two touch points.
function getDistance(touch1, touch2) {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        isPinching = true;
        startDistance = getDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].pageX - container.offsetLeft;
        startY = e.touches[0].pageY - container.offsetTop;
        prevX = e.touches[0].pageX;
        prevY = e.touches[0].pageY;
        scrollLeft = container.scrollLeft;
        scrollTop = container.scrollTop;

        // Stop any ongoing momentum animation.
        velocityX = 0;
        velocityY = 0;
        cancelAnimationFrame(momentumAnimation);
    }
});

container.addEventListener('touchmove', (e) => {
    if (isPinching && e.touches.length === 2) {
        e.preventDefault();

        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scaleChange = currentDistance / startDistance;

        // Update scale.
        scale *= scaleChange;
        scale = Math.min(Math.max(scale, 0.1), 10); // Keep a min and max value.

        svg.style.transform = `scale(${scale})`;

        startDistance = currentDistance;
    } else if (isDragging && e.touches.length === 1) {
        const x = e.touches[0].pageX;
        const y = e.touches[0].pageY;
        const deltaX = x - startX;
        const deltaY = y - startY;

        container.scrollLeft = scrollLeft - deltaX;
        container.scrollTop = scrollTop - deltaY;

        // Calculate velocity for momentum.
        velocityX = x - prevX;
        velocityY = y - prevY;
        prevX = x;
        prevY = y;
    }
});

container.addEventListener('touchend', (e) => {
    if (isPinching && e.touches.length < 2) {
        isPinching = false;
        startDistance = 0;
    } else if (isDragging && e.touches.length === 0) {
        isDragging = false;
        applyMomentum(velocityX, velocityY);
    }
});