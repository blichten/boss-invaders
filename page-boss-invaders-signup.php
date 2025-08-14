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

/* Container - Increased height to accommodate all content */
.bil-signup-container {
    background: #0b1021;
    border: 1px solid #25308a;
    border-radius: 12px;
    padding: 32px;
    max-width: 520px;
    width: 100%;
    min-height: 600px; /* Ensure enough height for all content */
    box-shadow: 0 8px 24px rgba(0,0,0,.3);
    display: flex;
    flex-direction: column;
}

/* Header image section */
.bil-hero-header {
    text-align: center;
    margin-bottom: 24px;
}

.bil-hero-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 20px;
}

/* Form styles */
.bil-form {
    background: transparent;
    color: #fff;
    border: none;
    padding: 0;
    box-shadow: none;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.bil-form h2 {
    margin: 0 0 16px;
    font-size: 28px;
    font-weight: 700;
    text-align: center;
    color: #fff;
    margin-bottom: 20px;
}

.bil-form p {
    margin: 0 0 24px;
    opacity: 0.9;
    text-align: center;
    font-size: 15px;
    line-height: 1.5;
}

.bil-form label {
    display: block;
    margin: 20px 0 10px;
    font-weight: 600;
    font-size: 15px;
    color: #e8edf9;
}

.bil-form input[type="text"],
.bil-form input[type="email"] {
    width: 100%;
    padding: 14px;
    border-radius: 8px;
    border: 1px solid #1c2452;
    background: #050816;
    color: #e8edf9;
    font-size: 15px;
    transition: all 0.2s ease;
}

.bil-form input[type="text"]:focus,
.bil-form input[type="email"]:focus {
    outline: none;
    border-color: #FF6600;
    box-shadow: 0 0 0 3px rgba(255, 102, 0, 0.2);
    background: #0a0f1e;
}

.bil-form .bil-consent {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-weight: 500;
    font-size: 14px;
    margin: 24px 0;
    line-height: 1.5;
}

.bil-form .bil-consent input[type="checkbox"] {
    margin: 0;
    flex-shrink: 0;
    margin-top: 2px;
    width: 18px;
    height: 18px;
    accent-color: #FF6600;
}

.bil-form button {
    background: #FF6600;
    color: #fff;
    border: 0;
    border-radius: 12px;
    padding: 16px 24px;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    font-size: 18px;
    transition: all 0.2s ease;
    margin-top: 24px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
}

.bil-form button:hover {
    background: #e55a00;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(255, 102, 0, 0.4);
}

.bil-form button:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(255, 102, 0, 0.3);
}

.bil-form .bil-msg {
    margin-top: 20px;
    min-height: 1.4em;
    text-align: center;
    font-size: 14px;
    padding: 12px;
    border-radius: 8px;
}

.bil-form .bil-msg.success {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
}

.bil-form .bil-msg.error {
    color: #f87171;
    background: rgba(248, 113, 113, 0.1);
    border: 1px solid rgba(248, 113, 113, 0.3);
}

/* Responsive adjustments */
@media (max-width: 480px) {
    .bil-signup-container {
        padding: 24px 20px;
        margin: 10px;
        min-height: 550px;
    }
    
    .bil-form h2 {
        font-size: 24px;
    }
    
    .bil-form input[type="text"],
    .bil-form input[type="email"] {
        padding: 12px;
    }
    
    .bil-form button {
        padding: 14px 20px;
        font-size: 16px;
    }
    
    .bil-hero-image {
        margin-bottom: 16px;
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
    <!-- Hero Header Section -->
    <div class="bil-hero-header">
        <img src="<?php echo get_template_directory_uri(); ?>/assets/img/boss-invaders-header.webp" 
             alt="Boss Invaders - Leadership Game" 
             class="bil-hero-image"
             onerror="this.style.display='none'">
    </div>
    
    <?php
    // Output the signup form using the shortcode
    echo do_shortcode('[boss_invaders_signup]');
    ?>
</div>

<?php
// Get the footer (minimal)
get_footer();
?>
