<?php
/**
 * Template Name: Boss Invaders Signup - Minimal
 * 
 * A minimal template that bypasses Elementor and provides a clean signup page
 * for the Boss Invaders game. This template loads only essential WordPress
 * functionality and custom CSS.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Get the header (minimal)
get_header(); 

// Custom CSS for the signup page
?>
<style>
/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: #0b1021;
    color: #fff;
    line-height: 1.6;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

/* Container */
.bil-signup-container {
    background: #0b1021;
    border: 1px solid #25308a;
    border-radius: 12px;
    padding: 24px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 8px 24px rgba(0,0,0,.3);
}

/* Form styles */
.bil-form {
    background: transparent;
    color: #fff;
    border: none;
    padding: 0;
    box-shadow: none;
}

.bil-form h2 {
    margin: 0 0 16px;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    color: #fff;
}

.bil-form p {
    margin: 0 0 20px;
    opacity: 0.9;
    text-align: center;
    font-size: 14px;
}

.bil-form label {
    display: block;
    margin: 16px 0 8px;
    font-weight: 600;
    font-size: 14px;
    color: #e8edf9;
}

.bil-form input[type="text"],
.bil-form input[type="email"] {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #1c2452;
    background: #050816;
    color: #e8edf9;
    font-size: 14px;
    transition: border-color 0.2s ease;
}

.bil-form input[type="text"]:focus,
.bil-form input[type="email"]:focus {
    outline: none;
    border-color: #0066FF;
    box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.2);
}

.bil-form .bil-consent {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-weight: 500;
    font-size: 13px;
    margin: 20px 0;
    line-height: 1.4;
}

.bil-form .bil-consent input[type="checkbox"] {
    margin: 0;
    flex-shrink: 0;
    margin-top: 2px;
}

.bil-form button {
    background: #0066FF;
    color: #fff;
    border: 0;
    border-radius: 10px;
    padding: 14px 20px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    font-size: 16px;
    transition: background-color 0.2s ease;
    margin-top: 8px;
}

.bil-form button:hover {
    background: #0052cc;
}

.bil-form button:active {
    transform: translateY(1px);
}

.bil-form .bil-msg {
    margin-top: 16px;
    min-height: 1.4em;
    text-align: center;
    font-size: 14px;
}

.bil-form .bil-msg.success {
    color: #4ade80;
}

.bil-form .bil-msg.error {
    color: #f87171;
}

/* Responsive adjustments */
@media (max-width: 480px) {
    .bil-signup-container {
        padding: 20px;
        margin: 10px;
    }
    
    .bil-form h2 {
        font-size: 22px;
    }
    
    .bil-form input[type="text"],
    .bil-form input[type="email"] {
        padding: 10px;
    }
    
    .bil-form button {
        padding: 12px 18px;
    }
}

/* Hide any Elementor elements that might still load */
.elementor,
.elementor-widget,
.elementor-section {
    display: none !important;
}
</style>

<div class="bil-signup-container">
    <?php
    // Output the signup form using the shortcode
    echo do_shortcode('[boss_invaders_signup]');
    ?>
</div>

<?php
// Get the footer (minimal)
get_footer();
?>
